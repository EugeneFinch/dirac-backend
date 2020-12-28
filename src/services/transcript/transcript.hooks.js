const { authenticate } = require('@feathersjs/authentication');

const { discardQuery ,discard} = require('feathers-hooks-common');
const { searchByKeyword, hightLightKeyword } = require('./utils');


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
    find: [hightLightKeyword,discard('search_content')],
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
