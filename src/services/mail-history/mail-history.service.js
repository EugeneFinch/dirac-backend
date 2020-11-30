// Initializes the `mail-history` service on path `/mail-history`
const createService = require('feathers-sequelize');
const createModel = require('../../models/mail-history.model');
const hooks = require('./mail-history.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/mail-history', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('mail-history');

  service.hooks(hooks);
};
