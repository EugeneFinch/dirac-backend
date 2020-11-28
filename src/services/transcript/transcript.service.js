// Initializes the `transcript` service on path `/transcript`
const createService = require('feathers-sequelize');
const createModel = require('../../models/transcript.model');
const hooks = require('./transcript.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate,
    multi: ['create']
  };

  // Initialize our service with any options it requires
  app.use('/transcript', function (req, res, next) {
    req.feathers.token = req.headers.authorization;
    next();
  },
    createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('transcript');

  service.hooks(hooks);
};
