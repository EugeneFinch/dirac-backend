
const { authenticate } = require('@feathersjs/authentication');
const {  BadRequest } = require('@feathersjs/errors');
const get = require('lodash/get');
module.exports = {
  before: {
    all: [],
    find: [
      authenticate('jwt'),
      ctx=>{
        if (!get(ctx, 'params.query.recording_id')) {
          throw new BadRequest('Missing params recording_id');
        }
      }
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
