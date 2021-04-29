const { disallow } = require('feathers-hooks-common');
const dialogFlow = require('../../dialogFlow');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [async (ctx) => {
      for (let res in ctx.data) {
        const intent = await dialogFlow(ctx.data[res].question);
        ctx.data[res].intent = intent ? intent.intent.displayName : '';
        ctx.data[res].intent_info = intent ? intent : {};
      }
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
