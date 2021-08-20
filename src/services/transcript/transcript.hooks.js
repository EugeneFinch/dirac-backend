const { authenticate } = require('@feathersjs/authentication');

const { discardQuery ,discard} = require('feathers-hooks-common');
const { searchContent,searchByKeyword, hightLightKeyword } = require('./utils');


module.exports = {
  before: {
    all: [],
    find: [
      authenticate('jwt'),
      (ctx)=> {ctx.query = ctx.params.query;},
      searchByKeyword,
      searchContent,
      discardQuery('predefined_keyword','content')
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
