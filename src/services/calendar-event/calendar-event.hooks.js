
const queryByUserId = require('../../hooks/query-by-userId.hooks');
const { authenticate } = require('@feathersjs/authentication');


module.exports = {
  before: {
    all: [],
    find: [authenticate('jwt'), queryByUserId],
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
