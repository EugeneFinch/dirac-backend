
const { authenticate } = require('@feathersjs/authentication');
const startTranscribe = require('../../hooks/recordings/start-transcribe');
const signUrl = require('../../hooks/recordings/sign-url');
const { configAuthentication } = require('../../utils');

module.exports = {
  before: {
    all: [],
    find: [configAuthentication, authenticate('jwt')],
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
