// Initializes the `transcript-keyword` service on path `/transcript-keyword`
const createService = require('./transcript-keyword.class.js');
const hooks = require('./transcript-keyword.hooks');

module.exports = function (app) {
  
  const options = {
    app
  };

  // Initialize our service with any options it requires
  app.use('/transcript-keyword', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('transcript-keyword');

  service.hooks(hooks);
};
