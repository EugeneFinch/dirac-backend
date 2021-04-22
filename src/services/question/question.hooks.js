const { disallow } = require('feathers-hooks-common');
const dialogFlow = require('../../dialogFlow');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [async (ctx) => {
      for (let res in ctx.data)
        ctx.data[res].intent = await dialogFlow(ctx.data[res].question);
    }],
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
