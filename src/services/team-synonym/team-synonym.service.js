// Initializes the `team-synonym` service on path `/team-synonym`
const { TeamSynonym } = require('./team-synonym.class');
const createModel = require('../../models/team-synonym.model');
const hooks = require('./team-synonym.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/team-synonym', new TeamSynonym(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('team-synonym');

  service.hooks(hooks);
};
