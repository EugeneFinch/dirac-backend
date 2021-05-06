const AWS = require('aws-sdk');


module.exports = function (context) {
  // if (!context.result.url) {
  //   context.result.url = '';
  //   return;
  // }
  // const s3 = new AWS.S3({
  //   accessKeyId: context.app.get('AWS_ACCESS_KEY_ID'),
  //   secretAccessKey: context.app.get('AWS_SECRET_ACCESS_KEY'),
  // });
  // var params = { Bucket: 'transcripts-dirac', Key: context.result.url };
  // var url = s3.getSignedUrl('getObject', params);
  const url = `https://d29uc2225pftaf.cloudfront.net/${context.result.url}`
  context.result.url = url;
};
