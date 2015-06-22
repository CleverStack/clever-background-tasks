var Task       = require('classes').BackgroundTask
  , taskName   = process.env.TASK_NAME || 'Unknown';

module.exports = new Task(taskName);
