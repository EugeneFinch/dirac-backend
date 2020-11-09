// Initializes the `transcribe-parser` service on path `/transcribe-parser`
const createService = require('./transcribe-parser.class.js');
const hooks = require('./transcribe-parser.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    paginate,
    app
  };

  // Initialize our service with any options it requires
  app.use('/transcribe-parser', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('transcribe-parser');

  service.hooks(hooks);
};
