'use strict';

var fs      = require( 'fs' )
  , path    = require( 'path' )
  , crypto  = require( 'crypto' )
  , _       = require( 'underscore' );

module.exports = function( grunt ) {
    var defaultConfig   = require( path.join( __dirname, 'config', 'default.json' ) )
      , configFile      = null
      , config          = {};

    return [{
        prompt: {
            backgroundTasksConfigPrompt: {
                options: {
                    questions: [
                        {
                            config: 'cleverBackgroundTasksConfig.environment',
                            type: 'list',
                            message: 'What environment is this configuration for?',
                            choices: [
                                { name: 'LOCAL' },
                                { name: 'TEST' },
                                { name: 'DEV' },
                                { name: 'STAG' },
                                { name: 'PROD' }
                            ],
                            default: function() {
                                return process.env.NODE_ENV ? process.env.NODE_ENV.toUpperCase() : 'LOCAL';
                            },
                            filter: function( env ) {
                                _.extend( config, defaultConfig );

                                configFile = path.resolve( path.join( __dirname, '..', '..', 'config', env.toLowerCase() + '.json' ) );

                                if ( fs.existsSync( configFile ) ) {
                                    _.extend( config, require( configFile ) );
                                    
                                    Object.keys( defaultConfig[ 'clever-background-tasks' ] ).forEach( function( key ) {
                                        if ( typeof config[ 'clever-background-tasks' ][ key ] === 'undefined' ) {
                                            config[ 'clever-background-tasks' ][ key ] = defaultConfig[ 'clever-background-tasks' ][ key ];
                                        }
                                    });
                                }

                                return true;
                            }
                        },
                        {
                            config: 'cleverBackgroundTasksConfig.enabled',
                            type: 'confirm',
                            message: 'Enabled',
                            default: true
                        },
                        {
                            config: 'cleverBackgroundTasksConfig.interval',
                            type: 'input',
                            message: 'Interval between running tasks',
                            default: function() {
                                return config[ 'clever-background-tasks' ].interval !== undefined ? config[ 'clever-background-tasks' ].interval : 2500;
                            }
                        },
                        {
                            config: 'cleverBackgroundTasksConfig.driver',
                            type: 'list',
                            message: 'Session Storage Driver',
                            choices: [
                                { name: 'redis' },
                                { name: 'memcache' },
                                { name: 'disabled' }
                            ],
                            default: function() {
                                return config[ 'clever-background-tasks' ].driver !== '' ? config[ 'clever-background-tasks' ].driver : 'redis';
                            }
                        },
                        {
                            when: function( answers ) {
                                return answers[ 'cleverBackgroundTasksConfig.driver' ] === 'redis';
                            },
                            config: 'cleverBackgroundTasksConfig.redis.host',
                            type: 'input',
                            message: 'Redis host',
                            default: function() {
                                return config[ 'clever-background-tasks' ].redis.host !== '' ? config[ 'clever-background-tasks' ].redis.host : 'localhost';
                            }
                        },
                        {
                            when: function( answers ) {
                                return answers[ 'cleverBackgroundTasksConfig.driver' ] === 'redis';
                            },
                            config: 'cleverBackgroundTasksConfig.redis.port',
                            type: 'input',
                            message: 'Redis port',
                            default: function() {
                                return config[ 'clever-background-tasks' ].redis.port !== '' ? config[ 'clever-background-tasks' ].redis.port : '6379';
                            }
                        },
                        {
                            when: function( answers ) {
                                return answers[ 'cleverBackgroundTasksConfig.driver' ] === 'memcache';
                            },
                            config: 'cleverBackgroundTasksConfig.memcache.host',
                            type: 'input',
                            message: 'Memcache host',
                            default: function() {
                                return config[ 'clever-background-tasks' ].memcache.host !== '' ? config[ 'clever-background-tasks' ].memcache.host : 'localhost';
                            }
                        },
                        {
                            when: function( answers ) {
                                return answers[ 'cleverBackgroundTasksConfig.driver' ] === 'memcache';
                            },
                            config: 'cleverBackgroundTasksConfig.memcache.port',
                            type: 'input',
                            message: 'Memcache port',
                            default: function() {
                                return config[ 'clever-background-tasks' ].memcache.port !== '' ? config[ 'clever-background-tasks' ].memcache.port : '11211';
                            }
                        }
                    ]
                }
            },
            addBackgroundTaskPrompt: {
                options: {
                    questions: [
                        {
                            config: 'addBackgroundTaskConfig.environment',
                            type: 'list',
                            message: 'What environment is this configuration for?',
                            choices: [
                                { name: 'LOCAL' },
                                { name: 'TEST' },
                                { name: 'DEV' },
                                { name: 'STAG' },
                                { name: 'PROD' }
                            ],
                            default: function() {
                                return process.env.NODE_ENV ? process.env.NODE_ENV.toUpperCase() : 'LOCAL';
                            },
                            filter: function( env ) {
                                _.extend( config, defaultConfig );

                                configFile = path.resolve( path.join( __dirname, '..', '..', 'config', env.toLowerCase() + '.json' ) );

                                if ( fs.existsSync( configFile ) ) {
                                    _.extend( config, require( configFile ) );
                                    
                                    Object.keys( defaultConfig[ 'clever-background-tasks' ] ).forEach( function( key ) {
                                        if ( typeof config[ 'clever-background-tasks' ][ key ] === 'undefined' ) {
                                            config[ 'clever-background-tasks' ][ key ] = defaultConfig[ 'clever-background-tasks' ][ key ];
                                        }
                                    });
                                }

                                return true;
                            }
                        },
                        {
                            config: 'addBackgroundTaskConfig.enabled',
                            type: 'confirm',
                            message: 'Enabled',
                            default: true
                        },
                        {
                            config: 'addBackgroundTaskConfig.name',
                            type: 'input',
                            message: 'Name',
                            default: 'ExampleTask'
                        },
                        {
                            config: 'addBackgroundTaskConfig.parallel',
                            type: 'confirm',
                            message: 'Parallel',
                            default: true
                        },
                        {
                            config: 'addBackgroundTaskConfig.numWorkers',
                            type: 'input',
                            message: 'Number of workers',
                            default: 1,
                            filter: function( val ) {
                                return parseInt( val, 10 );
                            }
                        }
                    ]
                }
            }
        }
    }, function( grunt ) {
        grunt.loadNpmTasks( 'grunt-prompt' );
        
        grunt.registerTask( 'prompt:cleverBackgroundTasksConfig', [ 'prompt:backgroundTasksConfigPrompt', 'createCleverBackgroundTasksConfig' ] );
        grunt.registerTask( 'createCleverBackgroundTasksConfig', 'Adds the config for cleverBackgroundTasks to the designated environment', function ( ) {
            var conf = grunt.config( 'cleverBackgroundTasksConfig' );

            delete conf.environment;

            config[ 'clever-background-tasks' ] = _.extend( config[ 'clever-background-tasks' ], conf );

            if ( config[ 'clever-background-tasks' ].driver !== 'redis' ) {
                delete config[ 'clever-background-tasks' ].redis;
            }

            if ( config[ 'clever-background-tasks' ].driver !== 'memcache' ) {
                delete config[ 'clever-background-tasks' ].memcache;
            }

            fs.writeFileSync( configFile, JSON.stringify( config, null, '  ' ) );
        });

        grunt.registerTask( 'prompt:addBackgroundTask', [ 'prompt:addBackgroundTaskPrompt', 'addBackgroundTaskConfig' ] );
        grunt.registerTask( 'addBackgroundTaskConfig', 'Adds a background task to the designated environments configuration file', function ( ) {
            var conf = grunt.config( 'addBackgroundTaskConfig' );

            delete conf.environment;

            config[ 'clever-background-tasks' ].tasks = _.extend( config[ 'clever-background-tasks' ].tasks, [ conf ] );

            fs.writeFileSync( configFile, JSON.stringify( config, null, '  ' ) );
        });

        
    }];
};