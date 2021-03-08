
// Initializes the `calendar-event` service on path `/calendar-event`
const createService = require('feathers-sequelize');
const createModel = require('../../models/calendar-event.model');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/cronjob-calendar-event', createService(options));

  // Get our initialized service so that we can register hooks
  app.service('cronjob-calendar-event');
};
