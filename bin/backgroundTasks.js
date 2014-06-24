var utils     = require( 'utils' )
  , env       = utils.bootstrapEnv()
  , moduleLdr = env.moduleLoader
  , bgTasks   = require( 'classes' ).BackgroundTasks;

moduleLdr.on( 'modulesLoaded', function() {
    module.exports = new bgTasks( env );
});

moduleLdr.loadModules();