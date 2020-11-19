const createService = require('./transcript-parser.class.js');
const hooks = require('./transcript-parser.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    paginate,
    app
  };

  // Initialize our service with any options it requires
  app.use('/transcript-parser', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('transcript-parser');

  service.hooks(hooks);
};
