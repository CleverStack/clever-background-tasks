CleverStack Background Tasks Module
====================
[![NPM version](https://badge.fury.io/js/clever-background-tasks.png)](http://badge.fury.io/js/clever-background-tasks) [![GitHub version](https://badge.fury.io/gh/cleverstack%2Fclever-background-tasks.png)](http://badge.fury.io/gh/cleverstack%2Fclever-background-tasks) [![Dependency Status](https://david-dm.org/CleverStack/clever-background-tasks.png)](https://david-dm.org/CleverStack/clever-background-tasks) [![devDependency Status](https://david-dm.org/CleverStack/clever-background-tasks/dev-status.png)](https://david-dm.org/CleverStack/clever-background-tasks#info=devDependencies) [![Code Climate](https://codeclimate.com/github/CleverStack/clever-background-tasks.png)](https://codeclimate.com/github/CleverStack/clever-background-tasks) [![Build Status](https://secure.travis-ci.org/CleverStack/clever-background-tasks.png?branch=master)](https://travis-ci.org/CleverStack/clever-background-tasks) [![Coverage](https://codeclimate.com/github/CleverStack/clever-background-tasks/coverage.png)](https://codeclimate.com/github/CleverStack/clever-background-tasks) [![NPM downloads](http://img.shields.io/npm/dm/clever-background-tasks.png)](https://www.npmjs.org/package/clever-background-tasks) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/) 

![CleverStack NodeJS Background Tasks Module](http://cleverstack.github.io/assets/img/logos/node-seed-logo-clean.png "CleverStack NodeJS Background Tasks Module")
<blockquote>
This CleverStack Module provides the ability to run multiple background processes that can run "Tasks", this free's the event loop up inside the http workers to respond to web requests while processing can take place in the background.
</blockquote>

## Documentation

See [cleverstack.io](http://cleverstack.io/documentation/#backend) for more detailed information on the Node seed or visit the [Getting Started Guide](http://cleverstack.io/getting-started/)

## Configuration
Simply add the following config to your /config/local.json (or into your global.json for all environments, or in whatever environment you are using). See https://github.com/CleverStack/clever-background-tasks/wiki/Configuration

### Grunt
1. `grunt prompt:cleverBackgroundTasksConfig` can be used to generate your config for any environment you want
2. `grunt prompt:addBackgroundTask` can be used to add/edit tasks inside your config

### Configuration files

```
{
    "clever-background-tasks": {
        "enabled" : true,
        "interval": 2500,
        "tasks":[
            { "name": "ExampleTask", "parallel": true }
        ],
        "driver": "redis",
        "redis": {
            "host": "localhost",
            "port": "11211"
        }
    }
}
```

## Setup

### Using CLI
1. Run `clever install clever-background-tasks` and follow the prompts
2. Run `clever serve` to start your application.

### Without CLI
1. Clone this repo (or untar it there) into your modules folder (ie modules/clever-background-tasks)
2. Add 'clever-background-tasks' to the bundledDependencies array of your app's package.json.
3. Run `grunt prompt:cleverBackgroundTasksConfig` and fill in your configuration options.
4. Run `grunt prompt:addBackgroundTask` to add any tasks to your running configuration.
6. Run `grunt server` to start your application.

## License

See our [LICENSE](https://github.com/CleverStack/clever-background-tasks/blob/master/LICENSE)
