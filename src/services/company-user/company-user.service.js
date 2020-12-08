// Initializes the `company-user` service on path `/company-user`
const createService = require('feathers-sequelize');
const createModel = require('../../models/company-user.model');
const hooks = require('./company-user.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/company-user', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('company-user');

  service.hooks(hooks);
};
