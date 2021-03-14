const {
  getNoEngageQuestions,
  getTotalCompetitorMention,
  getLongestMonologue,
  fetchTranScript,
  getTeamTalkTime,
  getFillerWordPerMin,getNextStep 
} = require('./utils');

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
      getNextStep,
      getLongestMonologue,
      getTotalCompetitorMention,
      getNoEngageQuestions
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
