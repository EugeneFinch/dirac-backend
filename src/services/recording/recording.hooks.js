
const { authenticate } = require('@feathersjs/authentication');
const startTranscribe = require('../../hooks/recordings/start-transcribe');
const signUrl = require('../../hooks/recordings/sign-url');
const queryByUserId = require('../../hooks/query-by-userId.hooks');
const getUserInfo = require('../../hooks/get-user-info.hooks');
const getCalendarInfo = require('../../hooks/get-meet-info.hook.js')
const set = require('lodash/set');

module.exports = {
  before: {
    all: [],
    find: [authenticate('jwt'), queryByUserId, getUserInfo],
    get: [getUserInfo],
    create: [],
    update: [async (ctx) => {
      const data = ctx.data;
      const sequelize = ctx.app.get('sequelizeClient');
      const { recording } = sequelize.models;
      await recording.update({ deal_status: data.deal_status, account_name: data.account_name },
        { where: { user_id: data.user_id, account_name: data.old_name ? data.old_name : data.account_name } })
    }],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [getCalendarInfo],
    get: [getCalendarInfo, signUrl],
    create: [startTranscribe],
    update: [],
    patch: [startTranscribe],
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
