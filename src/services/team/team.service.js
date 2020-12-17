// Initializes the `team` service on path `/team`
const createService = require('feathers-sequelize');
const createModel = require('../../models/team.model');
const hooks = require('./team.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/team', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('team');

  service.hooks(hooks);
};
