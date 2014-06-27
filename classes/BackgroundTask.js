var Class   = require( 'classes' ).Class
  , chalk   = require( 'chalk' )
  , tasks   = require( 'tasks' )
  , debuggr = require( 'debug' )( 'BackgroundTasks' );

module.exports = Class.extend(
{
    env: null,
    taskClass: null
},
{
    task: null,

    name: null,

    isReady: false,

    setup: function( name ) {
        this.name = name;
        this.task = null;
        this.isReady = false;
        this.Class.env = require( 'utils' ).bootstrapEnv();
        this.Class.taskClass = tasks[ this.name ];
        process.on( 'message', this.proxy( 'runTask' ) );

        return [ this.Class.env.moduleLoader ];
    },

    init: function( moduleLoader ) {
        moduleLoader.on( 'modulesLoaded', this.proxy( 'ready' ) );
        moduleLoader.loadModules();
    },

    debug: function() {
        var args = [].slice.call( arguments );
        args[ 0 ] = chalk.yellow( this.name + '-' + process.pid ) + ':  ' + args[ 0 ];
        debuggr.apply( debuggr, args );
    },

    ready: function() {
        this.debug( 'Ready...' );
        this.processReady = true;
        process.send( { code: 'READY' } );
    },

    runTask: function( message ) {
        var payload = message.payload || {};

        if ( !this.processReady ) {
            this.debug( 'Process is not ready yet...' );
            process.send( { code: 'NOT_READY' } );
        } else if ( this.task !== null ) {
            this.debug( 'Still running previous task...' );
            process.send( { code: 'BUSY' } );
        } else {
            this.debug( 'Running task...' );
            this.task = new this.Class.taskClass( payload, this.proxy( 'taskFinished' ) );
        }
    },

    taskFinished: function( err, result ) {
        this.debug( 'Finished processing' + ( err !== null && err !== undefined ? ' with error: ' + err : '' ) );
        process.send( { code: 'RESULT', error: err, result: result } );
        process.nextTick( this.proxy( 'clearTask' ) );
    },

    clearTask: function() {
        this.task = null;
    }
});