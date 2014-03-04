var backgroundTasks = null
  , cp = require( 'child_process' );

module.exports = function( cluster, config, packageJson ) {
    if ( cluster.isMaster ) {
        Object.keys( cluster.workers ).forEach(function( id ) {
            cluster.workers[ id ].on('message', function( msg ) {
                console.log('Master ' + process.pid + ' received message from worker ' + id + '.', msg);
                
                //Send message to background task
                if( msg.cmd == 'backgroundTask' && config[ 'clever-background-tasks' ] && config[ 'clever-background-tasks' ].on === true){
                    backgroundTasks.send({ cmd: 'master', task:msg.task, wrkid: id });
                }
            });
        });

        if ( packageJson.bundledDependencies.indexOf( 'clever-background-tasks' ) !== -1 ) {
            if ( config[ 'clever-background-tasks' ] && config[ 'clever-background-tasks' ].on === true ) {
                function setupBackgroundTasks() {
                    console.log('Setup background tasks...');

                    backgroundTasks = cp.fork('./modules/clever-background-tasks/bin/backgroundTasks.js');
                    backgroundTasks.on('exit', setupBackgroundTasks);
                    backgroundTasks.on('message', function( msg ){
                        console.log('\nMaster ' + process.pid + ' received message from Background Task Process ' + this.pid + '.', msg);
                        msg['cmd'] = 'master';
                        
                        ( !msg.wrkid ) ? backgroundTasks.send( msg ) : cluster.workers[ msg.wrkid ].send( msg ) ;
                    });
                }
                setupBackgroundTasks();
            }
        }
    }
}