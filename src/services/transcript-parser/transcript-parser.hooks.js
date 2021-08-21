const _ = require('lodash');

const openAIService = require('./../open-ai/open-ai.class');
const sendGridService = require('./../../sendgrid');

module.exports = {
  before: {
    all: [],
    find: [],
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
    update: [
      async function (context) {
        const recordingId = context.id;

        const [data, emails] = await Promise.all([
          new openAIService().processingData({ recordingId }),
          new openAIService().getClientEmail({
            recordingId
          })
        ]) ;

        if(emails && emails[0]) {
          await new sendGridService().sendAnalyzeMeeting({ data, emails });
        }
      }
    ],
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
