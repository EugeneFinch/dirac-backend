const { authenticate } = require('@feathersjs/authentication');

const { discardQuery } = require('feathers-hooks-common');
const { searchByKeyword } = require('./utils');


module.exports = {
  before: {
    all: [],
    find: [
      authenticate('jwt'),
      searchByKeyword,
      discardQuery('predefined_keyword')
    ],
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
