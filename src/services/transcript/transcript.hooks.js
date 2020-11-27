const { authenticate } = require('@feathersjs/authentication');


module.exports = {
  before: {
    all: [],
    find: [
      context=>{
        context.params.authentication = {
          strategy: 'jwt',
          accessToken:context.params.token
        };
      },
      
      authenticate('jwt')],
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
