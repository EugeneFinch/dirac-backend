
const dauria = require('dauria');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
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
      await recordingSV.create({
        filename,
        url : `https://transcripts-dirac.s3-ap-southeast-1.amazonaws.com/${filename}`,
        status :'waiting'
      });
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
