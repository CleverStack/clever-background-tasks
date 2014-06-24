var path    = require( 'path' )
  , cp      = require( 'child_process' )
  , bgTasks = null;

function setupBackgroundTasks( debug ) {
    debug( 'Setup background tasks...' );

    bgTasks = cp.fork( path.resolve( path.join( __dirname, 'backgroundTasks.js' ) ) );

    bgTasks.on( 'exit', setupBackgroundTasks.bind( this, debug ) );
    bgTasks.on( 'message', function( msg ) {
        msg.cmd = 'master';

        debug( '%s recieved message from bgTasks process...', process.pid );
        if ( !msg.workerId ) {

            // We have no worker to send the message to, let the background tasks master know about it
            bgTasks.send( msg );
        } else {

            // Send the Task result back to the process who sent the original message
            cluster.workers[ msg.workerId ].send( msg );
        }
    });
}

module.exports = function( cluster, config, packageJson, debug ) {
    if ( packageJson.bundledDependencies.indexOf( 'clever-background-tasks' ) !== -1 && config[ 'clever-background-tasks' ].on === true ) {
        if ( cluster.isMaster ) {

            cluster.on( 'fork', function( worker ) {
                worker.on( 'message', function( msg ) {
                    debug( 'Received message from worker %s...', worker.id );
                    
                    if( msg.cmd == 'backgroundTask' && config[ 'clever-background-tasks' ] && config[ 'clever-background-tasks' ].on === true){
                        debug( 'Sending message to background tasks master process...' );

                        bgTasks.send({
                            cmd: 'master',
                            task: msg.task,
                            workerId: worker.id
                        });
                    }
                });
            });

            setupBackgroundTasks( debug );

        }
    }
}