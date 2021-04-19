const createService = require('./analytics-talk-to-listen.class.js');
const hooks = require('./analytics-talk-to-listen.hooks');

module.exports = function (app) {
  const options = [];

  app.use('/analytics-talk-to-listen', createService(options, app));

  const service = app.service('analytics-talk-to-listen');
  service.hooks(hooks);
};
