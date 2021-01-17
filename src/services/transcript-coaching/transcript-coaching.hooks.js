const {fetchTranScript,getTeamTalkTime,getFillerWordPerMin } = require('./utils');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [
      fetchTranScript,
      getTeamTalkTime,
      getFillerWordPerMin,
    ],
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
