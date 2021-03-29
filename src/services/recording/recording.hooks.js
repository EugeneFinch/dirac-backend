
const { authenticate } = require('@feathersjs/authentication');
const startTranscribe = require('../../hooks/recordings/start-transcribe');
const signUrl = require('../../hooks/recordings/sign-url');
const queryByUserId = require('../../hooks/query-by-userId.hooks');
const getUserInfo = require('../../hooks/get-user-info.hooks');
const getCalendarInfo = require('../../hooks/get-meet-info.hook.js')

module.exports = {
  before: {
    all: [],
    find: [ authenticate('jwt'),queryByUserId,getUserInfo],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [getCalendarInfo],
    get: [signUrl],
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
