// Initializes the `meeting-record` service on path `/meeting-record`
const createService = require('./meeting-record.class.js');
const hooks = require('./meeting-record.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    paginate,
    app
  };

  // Initialize our service with any options it requires
  app.use('/meeting-record', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('meeting-record');

  service.hooks(hooks);
};
