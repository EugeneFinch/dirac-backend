const AWS = require('aws-sdk');
const env = process.env.NODE_ENV || 'dev';
const { client } = require('../../sqlClient');

module.exports = async function (context) {
  const transcribeservice = new AWS.TranscribeService({
    accessKeyId: context.app.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: context.app.get('AWS_SECRET_ACCESS_KEY'),
    region:'ap-southeast-1'
  });
  
  if(context.result==='COMPLETED' || !context.data.url){
    return;
  }
  const users = await client.query(`Select users_on_call from recording where id = ${context.result.id}`);
  console.log('users ', users);
  var params = {
    TranscriptionJobName: `dirac-${env}-${context.result.id}`, //required
    Media: { /* required */
      MediaFileUri: `s3://transcripts-dirac/${context.data.url}`
    },
    LanguageCode: 'en-US', //ru-RU
    Settings: {
      MaxSpeakerLabels: +users[0].users_on_call > 1 ? +users[0].users_on_call + 1 : 2,
      ShowSpeakerLabels: true ,
      VocabularyFilterName: 'filter-1',
      VocabularyFilterMethod: 'mask',
      VocabularyName: 'Competitors',
    }
  };

  transcribeservice.startTranscriptionJob(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log('data', data);           // successful response
  });
    
};
