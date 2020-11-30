const gmail = require('../../gmail');


module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      async context=>{
        const mailHistoryService = context.app.service('mail-history');
        const history = await mailHistoryService.get(1);
        const historyId = history.history_id;
        const auth = gmail.authorize();
        const roomURL = await gmail.getRoomURL(auth,historyId);

        const data = context.data;
        let message = data.message.data;
        let buff = Buffer.from(message, 'base64');  
        message = JSON.parse(buff.toString('utf-8')); 
        const newHistoryId = message.historyId;
        await mailHistoryService.patch(1,{history_id : newHistoryId});

        if(!roomURL){
          console.log(`No room url found ${historyId}`);
          context.result = { message: `No room url found for history ${historyId}`};
          return;
        }

        context.data.room_url = roomURL;
      }
    ],
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
