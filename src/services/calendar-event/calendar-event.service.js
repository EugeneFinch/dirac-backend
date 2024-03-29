// Initializes the `calendar-event` service on path `/calendar-event`
const createService = require('feathers-sequelize');
const createModel = require('../../models/calendar-event.model');
const hooks = require('./calendar-event.hooks');
const { get } = require('lodash');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/calendar-event',
    (req, res, next) => {
      if (req.headers) {
        const access_token = get(req, 'headers.x-goog-channel-token');
        const [env, user_id] = get(req, 'headers.x-goog-channel-id', '').split('-');

        req.feathers.body = { user_id, access_token };
        console.log('dona before /calendar-event: ' + JSON.stringify({ user_id, access_token }));
      }
      next();
    },
    createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('calendar-event');

  service.hooks(hooks);
};
