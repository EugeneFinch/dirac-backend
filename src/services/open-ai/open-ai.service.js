const createService = require('./open-ai.class.js');
const hooks = require('./open-ai.hooks');

module.exports = function (app) {

  const paginate = app.get('paginate');

  const options = {
    paginate,
    app
  };

  // Initialize our service with any options it requires
  app.use('/open-ai', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('open-ai');

  service.hooks(hooks);
};
