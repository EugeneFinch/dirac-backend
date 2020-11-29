const { authenticate } = require('@feathersjs/authentication');
const { configAuthentication } = require('../../utils')

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
