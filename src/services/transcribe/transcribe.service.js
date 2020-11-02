// Initializes the `transcribe` service on path `/transcribe`
const createService = require('feathers-sequelize');
const createModel = require('../../models/transcribe.model');
const hooks = require('./transcribe.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/transcribe', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('transcribe');

  service.hooks(hooks);
};
