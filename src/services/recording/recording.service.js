// Initializes the `recording` service on path `/recording`
const createService = require('feathers-sequelize');
const createModel = require('../../models/recording.model');
const hooks = require('./recording.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/recording', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('recording');

  service.hooks(hooks);
};
