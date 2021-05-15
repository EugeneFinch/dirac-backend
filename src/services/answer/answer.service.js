// Initializes the `team` service on path `/team`
const createService = require('feathers-sequelize');
const createModel = require('../../models/answer.model');
const hooks = require('./answer.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate,
    multi: ['create']
  };

  // Initialize our service with any options it requires
  app.use('/answer', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('answer');

  service.hooks(hooks);
};
