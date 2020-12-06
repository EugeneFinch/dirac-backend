
const { authenticate } = require('@feathersjs/authentication');
const startTranscribe = require('../../hooks/recordings/start-transcribe');
const signUrl = require('../../hooks/recordings/sign-url');
const queryByUserId = require('../../hooks/query-by-userId.hooks');

module.exports = {
  before: {
    all: [],
    find: [ authenticate('jwt'),queryByUserId],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
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
