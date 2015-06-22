var path    = require('path')
  , cp      = require('child_process')
  , bgTasks = null;

function setupBackgroundTasks(cluster, debug) {
  debug('Setup background tasks...');

  bgTasks = cp.fork(path.resolve(path.join(__dirname, 'manager.js')));

  bgTasks.on('exit', setupBackgroundTasks.bind(this, cluster, debug));
  bgTasks.on('message', function(msg) {
    debug('%s recieved message from bgTasks process...', process.pid);
    if (!msg.httpWorkerId) {

      // We have no worker to send the message to, let the background tasks master know about it
      // bgTasks.send(msg);
      
      debug('HTTP Worker that request task to be run is no longer active...');
    } else {

      debug('Sending task result to http worker %s', msg.httpWorkerId);
      cluster.workers[msg.httpWorkerId].send(msg);
    }
  });
}

module.exports = function clusterHook(cluster, config, packageJson, debug) {
  if (config['clever-background-tasks'].enabled === true) {
    if (cluster.isMaster) {

      cluster.on('fork', function(worker) {
        worker.on('message', function(msg) {
          debug('Received message from worker %s...', worker.process.pid);

          if(msg.cmd === 'backgroundTask'){
            debug('Sending message to background tasks master process...');

            msg.httpWorkerId = worker.id;
            bgTasks.send(msg);
          }
        });
      });

      setupBackgroundTasks(cluster, debug);

    }
  }
};
