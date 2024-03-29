const gmail = require('../../gmail');
const get = require('lodash/get');

const getRecordingName = (roomURL) => {
  if(roomURL.includes('meet.google.com')){
    return 'Gmeet meeting';
  }
};


module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      async context=>{
        try{
          let {joinFromCronjobCalendar, room_url, user_id} = context.data;
          let roomURL;

          if (joinFromCronjobCalendar && user_id) {
            roomURL = room_url
          } else {
            const mailHistoryService = context.app.service('mail-history');
            const history = await mailHistoryService.get(1);
            const historyId = history.history_id;
            const auth = gmail.authorize(context.app);

            const data = context.data;
            let message = data.message.data;
            let buff = Buffer.from(message, 'base64');
            message = JSON.parse(buff.toString('utf-8'));
            const newHistoryId = message.historyId;
            await mailHistoryService.patch(1,{history_id : newHistoryId});

            const info = await gmail.getInviteInfo(auth,historyId);
            if(!info){
              context.result = { message: 'No Info'};
              return;
            }

            const {host} = info;
            roomURL = info.roomURL;
            const {data:user} = await context.app.service('users').find({
              query: {
                email:host,
                $limit: 1,
              }
            });

            if(user.length === 0){
              const msg = `Host ${host} not exist in system yet`;
              console.log(msg);
              context.result = { message: msg};
              return;
            }

            if(!roomURL){
              console.log(`No room url found ${historyId}`);
              context.result = { message: `No room url found for history ${historyId}`};
              return;
            }

            user_id = get(user, '0.id')

            const record = await context.app.service('recording').create({
              user_id,
              status: 'RECORDING',
              filename:getRecordingName(roomURL),
              account_name: '',
              subject: getRecordingName(roomURL),
              deal_status: 'ip',
              url:'',
            });

            context.data.record_id = record.id;
          }

          context.data.room_url = roomURL;
        }catch(err){
          console.log('err', err);
        }

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
