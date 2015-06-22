var config     = require('config')
  , cluster    = require('cluster')
  , Manager    = require('classes').BackgroundTasks;

module.exports = Manager(config, cluster);
