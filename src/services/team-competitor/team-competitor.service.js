// Initializes the `team-competitor` service on path `/team-competitor`
const { TeamCompetitor } = require('./team-competitor.class');
const createModel = require('../../models/team-competitor.model');
const hooks = require('./team-competitor.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/team-competitor', new TeamCompetitor(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('team-competitor');

  service.hooks(hooks);
};
