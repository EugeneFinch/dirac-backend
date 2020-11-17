const AWS = require('aws-sdk');


module.exports = function (context) {
  const s3 = new AWS.S3({
    accessKeyId: context.app.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: context.app.get('AWS_SECRET_ACCESS_KEY'),
  });
  var params = {Bucket: 'transcripts-dirac', Key: context.result.url};
  var url = s3.getSignedUrl('getObject', params);
  context.result.url = url; 
};
