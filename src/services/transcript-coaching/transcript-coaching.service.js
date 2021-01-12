// Initializes the `transcript-coaching` service on path `/transcript-coaching`
const createService = require('feathers-sequelize');
const createModel = require('../../models/transcript-coaching.model');
const hooks = require('./transcript-coaching.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/transcript-coaching', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('transcript-coaching');

  service.hooks(hooks);
};
