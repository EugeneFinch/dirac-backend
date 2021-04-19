// Initializes the `speaker` service on path `/speaker`
const createService = require('feathers-sequelize');
const createModel = require('../../models/speakers-data.model');
const hooks = require('./speakers-data.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate,
    multi: ['create']
  };

  // Initialize our service with any options it requires
  app.use('/speakers-data', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('speakers-data');

  service.hooks(hooks);
};
