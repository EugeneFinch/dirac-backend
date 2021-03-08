
const queryByUserId = require('../../hooks/query-by-userId.hooks');
const { authenticate } = require('@feathersjs/authentication');
const { get } = require('lodash');
const calendar = require('../../calendar');


module.exports = {
  before: {
    all: [],
    find: [authenticate('jwt'), queryByUserId],
    get: [],
    create: [
      async context => {
        try {
          const key = context.app.get('GOOGLE_API_KEY');
          console.log(context);
          const user_id = get(context, 'params.body.user_id');
          const access_token = get(context, 'params.body.access_token');
          const userInfo = await context.app.service('users').get(user_id);

          const email = get(userInfo, 'email');
          const syncToken = get(userInfo, 'nextSyncToken');

          calendar.handleUpdateCalendarEvent({ app: context.app, token: access_token, email, key, syncToken, user_id });
          context.result = { message: 'success' };
        }
        catch (e) {
          context.result = { message: e };
        }
      }],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
