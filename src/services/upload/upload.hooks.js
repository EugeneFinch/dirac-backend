
const dauria = require('dauria');
const { authenticate } = require('@feathersjs/authentication');
const get = require('lodash/get');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      // authenticate('jwt'),
      function(context) {
        if (!context.data.uri && context.params.file){
          const file = context.params.file;
          const uri = dauria.getBase64DataURI(file.buffer, file.mimetype);
          context.data = {uri: uri,filename:file.originalname};
        }
      },
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [ async function(context) {
      const recordingSV = context.app.service('recording');
      const filename = context.data.filename;
      const userId = get(context,'params.user.id',0);
      const recordingId = get(context,'params.query.recording_id',null);
      if(recordingId === null){
        await recordingSV.create({
          filename,
          url : context.result.id,
          status :'IN_PROGRESS',
          user_id: userId
        });
      }else{
        await recordingSV.patch(recordingId,{
          filename,
          url : context.result.id,
          status :'IN_PROGRESS',
        });
      }
      
      if (context.result.uri ){
        delete context.result.uri;
      }
    }],
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
