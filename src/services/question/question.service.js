// Initializes the `team` service on path `/team`
const createService = require('feathers-sequelize');
const createModel = require('../../models/question.model');
const hooks = require('./question.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate,
    multi: ['create']
  };

  // Initialize our service with any options it requires
  app.use('/question', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('question');

  service.hooks(hooks);
};
