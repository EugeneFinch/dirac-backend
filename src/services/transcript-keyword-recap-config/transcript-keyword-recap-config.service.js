// Initializes the `transcript-keyword-recap-config` service on path `/transcript-keyword-recap-config`
const createService = require('feathers-sequelize');
const createModel = require('../../models/transcript-keyword-recap-config.model');
const hooks = require('./transcript-keyword-recap-config.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/transcript-keyword-recap-config', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('transcript-keyword-recap-config');

  service.hooks(hooks);
};
