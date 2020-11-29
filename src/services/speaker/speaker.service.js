// Initializes the `speaker` service on path `/speaker`
const createService = require('feathers-sequelize');
const createModel = require('../../models/speaker.model');
const hooks = require('./speaker.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate,
    multi: ['create']
  };

  // Initialize our service with any options it requires
  app.use('/speaker', function (req, res, next) {
    req.feathers.token = req.headers.authorization;
    next();
  }, createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('speaker');

  service.hooks(hooks);
};
