// Initializes the `upload` service on path `/upload`
const createService = require('./upload.class.js');
const hooks = require('./upload.hooks');
const multer = require('multer');
const multipartMiddleware = multer();
const blobService = require('feathers-blob');
const fs = require('fs-blob-store');
const blobStorage = fs('./uploads');
const S3BlobStore = require('s3-blob-store');
const AWS = require('aws-sdk');

module.exports = function (app) {
  const s3 = new AWS.S3({
    accessKeyId: app.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: app.get('AWS_SECRET_ACCESS_KEY'),
  });

  const blobStore = S3BlobStore({
    client: s3,
    bucket: 'transcripts-dirac',
  });

  app.use('/upload',
    multipartMiddleware.single('file'),
    function(req,res,next){
        req.feathers.file = req.file;
        next();
    },
    blobService({returnUri:false,Model: blobStorage})
  );
  // Get our initialized service so that we can register hooks
  const service = app.service('upload');

  service.hooks(hooks);
};
