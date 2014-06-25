var utils     = require( 'utils' )
  , env       = utils.bootstrapEnv()
  , moduleLdr = env.moduleLoader
  , tasks     = require( 'tasks' )
  , chalk     = require( 'chalk' )
  , debuggr   = require( 'debug' )( 'BackgroundTasks' )
  , ready     = false
  , task      = null;

function debug() {
    var args = [].slice.call( arguments );
    args[ 0 ] = chalk.yellow( process.env.TASK_NAME + '-' + process.pid ) + ':  ' + args[ 0 ];
    debuggr.apply( debuggr, args );
}

debug( 'Starting...' );

process.on( 'message', function( message ) {
    if ( !ready ) {
        debug( 'Not ready...' );
        process.send( { code: 'NOT_READY' } );
    } else if ( task !== null ) {
        debug( 'Still running...' );
        process.send( { code: 'BUSY' } );
    } else {
        debug( 'Running task...' );

        var payload = message.payload || {};
        task = new ( tasks[ process.env.TASK_NAME ] )( payload, function( err, result ) {
            process.nextTick(function() {
                task = null;
                process.send( { code: 'RESULT', error: err, result: result } );
            });
        });
    }
});

moduleLdr.on( 'modulesLoaded', function() {
    debug( 'Ready...' );
    ready = true;
    process.send( { code: 'READY' } );
    
});

moduleLdr.loadModules();