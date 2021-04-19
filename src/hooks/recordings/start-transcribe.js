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
  const users = await client.query(`Select user_name from speakers_data where recordingId = ${context.result.id} group by user_name`);
  console.log('users.length', users.length);
  var params = {
    TranscriptionJobName: `dirac-${env}-${context.result.id}`, //required
    Media: { /* required */
      MediaFileUri: `s3://transcripts-dirac/${context.data.url}`
    },
    ContentRedaction: {
      RedactionOutput: 'redacted' ,
      RedactionType: 'PII' 
    },
    LanguageCode: 'en-US', //ru-RU
    Settings: {
      MaxSpeakerLabels: users.length ||2,
      ShowSpeakerLabels: true ,
      VocabularyName: 'Competitors',
    }
  };

  transcribeservice.startTranscriptionJob(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log('data', data);           // successful response
  });
    
};
