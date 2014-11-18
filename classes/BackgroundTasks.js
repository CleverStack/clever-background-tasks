var Class       = require( 'classes' ).Class
  , path        = require( 'path' )
  , async       = require( 'async' )
  , injector    = require( 'injector' )
  , redis       = require( 'redis' )
  , debug       = require( 'debug' )( 'BackgroundTasks');

var BackgroundTasks = Class.extend(
{
    instance: null,

    getInstance: function( config, cluster ) {
        if ( this.instance === null ) {
            this.instance = new this( config, cluster );
        }

        return this.instance;
    }
},
{
    config: null,

    cluster: null,

    workers: null,

    interval: null,

    isMaster: false,

    setup: function( config, cluster ) {
        debug( 'Setting up...' );

        try {
            process.on( 'message', this.proxy( 'masterIpcMessage' ) );

            this.workers        = {};
            this.config         = config[ 'clever-background-tasks' ];
            this.cluster        = cluster;

            this.cluster.setupMaster({
                exec: path.resolve( path.join( __dirname, '..', 'bin', 'task.js' ) )
            });
            this.cluster.on( 'exit', this.proxy( 'workerExited' ) );
        } catch( e ) {
            return [ e ];
        }

        return [ null ];
    },

    init: function( err ) {
        if ( err === null ) {
            async.forEach(
                this.config.tasks,
                this.proxy( 'startTaskWorkers' ),
                this.proxy( 'schedule' )
            );
        } else {
            throw new Error( 'Cannot start background tasks because of error: ' + err );
        }
    },

    startTaskWorkers: function( task, callback ) {
        var that = this
          , numWorkers = task.numWorkers || 1
          , workersOnline = 0;

        function workerOnline() {
            that.registerWorker( this, task );

            workersOnline++;
            if ( workersOnline === task.numWorkers ) {
                callback( null );
            }
        }

        if ( typeof this.workers[ task.name ] !== 'object' ) {
            this.workers[ task.name ] = {};
        }

        for( var i = 0; i < numWorkers; i++ ) {
            this.forkWorker( task, workerOnline );
        }
    },

    forkWorker: function( task, callback ) {
        this.cluster.fork( { 'TASK_NAME': task.name } ).on( 'online', callback );
    },

    registerWorker: function( worker, task ) {
        this.workers[ task.name ][ worker.process.pid ] = worker;
        worker.on( 'message', this.proxy( 'workerIpcMessage', worker ) );
        worker.ready = false;
        worker.busy = false;
        worker.task = task;
        worker.runningTask = null;
    },

    schedule: function() {
        if ( this.interval !== null ) {
            clearInterval( this.interval );
        }

        this.interval = setInterval( this.proxy( 'run' ), this.config.interval );
    },

    run: function() {
        debug( 'Running tasks...' );
        async.each(
            Object.keys( this.workers ),
            this.proxy( 'runTaskWorkers' )
        );
    },

    runTaskWorkers: function( taskName ) {
        async.each(
            Object.keys( this.workers[ taskName ] ),
            this.proxy( 'runTaskOnWorker', taskName )
        );
    },

    runTaskOnWorker: function( taskName, pid ) {
        var task = this.workers[ taskName ][ pid ].task;
        if ( task.interval !== false && ( !task.masterOnly || !!task.masterOnly && !!this.isMaster ) ) {
            debug( 'Running '+ taskName + '...' );

            var worker = this.workers[ taskName ][ pid ];
            if ( !!worker.ready && !worker.busy ) {
                worker.send( { payload: null } );
            }
        }
    },

    workerExited: function( worker ) {
        var that = this;

        delete this.workers[ worker.task.name ][ worker.process.pid ];

        this.forkWorker( worker.task, function() {
            that.registerWorker( this, worker.task );
        });
    },

    masterIpcMessage: function( message ) {
        switch( message.cmd ) {

        case 'backgroundTask':
            var workers     = this.workers[ message.task ]
              , worker = false;


            if ( workers !== undefined ) {
                debug( 'Finding task process to use...' )

                Object.keys( workers ).forEach( function( workerPid ) {
                    var _worker = workers[ workerPid ];
                    if ( worker === false && _worker.ready === true && _worker.busy === false ) {
                        worker = _worker;
                    }
                });

                if ( worker !== false ) {
                    debug( 'Dispatching task to background process %s-%s...', message.task, worker.process.pid );

                    worker.busy = true;
                    worker.runningTask = message;
                    worker.send( message );
                } else {
                    debug( 'Unable to find a free background process to use, trying again it 500ms...' );

                    setTimeout( this.proxy( 'masterIpcMessage', message ), 500 );
                }

            } else {
                debug( 'Unknown task...' );

                message.error = 'Unknown task';
                message.result = false;

                process.send( message );
            }

            break;
        default:
            debug( 'Message from master %s', message );
            break;
        }
    },

    workerIpcMessage: function( worker, message ) {
        switch( message.code ) {
        
        case 'READY':
            debug( '%s is ready...', worker.process.pid );
            worker.ready = true;
            break;
        case 'NOT_READY':
            debug( '%s is not ready...', worker.process.pid );
            break;
        case 'BUSY':
            debug( '%s is busy...', worker.process.pid );
            break;
        case 'RESULT':
            if ( message.error === undefined || message.error === null ) {
                debug( '%s has finished processing task...', worker.process.pid );
            } else {
                debug( '%s failed to process task...', worker.process.pid );
            }

            if ( worker.runningTask !== null ) {
                debug( 'Sending result back to httpWorker...' );

                worker.runningTask.error = message.error;
                worker.runningTask.result = message.result;

                process.send( worker.runningTask );   

                worker.runningTask = null;
            }
            
            worker.busy = false;

            break;
        default:
            debug( '%s has sent a message we cannot understand (%s)', worker.process.pid, message );
            break;
        }
    }
});

module.exports = function( config, cluster ) {
    return BackgroundTasks.getInstance( config, cluster );
}