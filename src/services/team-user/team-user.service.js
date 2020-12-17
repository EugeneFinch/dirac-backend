// Initializes the `team-user` service on path `/team-user`
const createService = require('feathers-sequelize');
const createModel = require('../../models/team-user.model');
const hooks = require('./team-user.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/team-user', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('team-user');

  service.hooks(hooks);
};
