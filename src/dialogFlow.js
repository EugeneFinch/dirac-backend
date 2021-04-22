const dialogflow = require('@google-cloud/dialogflow');
const path = require('path');
const uuid = require('uuid');
const serviceAccPath = path.join(__dirname, `../config/dialogFlowServiceAcc.json`);


module.exports = async function init(question) {
  try {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccPath;
    const sessionId = uuid.v4();

    const sessionClient = new dialogflow.SessionsClient();
    const sessionPath = sessionClient.projectAgentSessionPath('dirac-296815', sessionId);

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: question,
          languageCode: 'en-US',
        },
      },
    };

    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}, question: ${question}`);
      return result.intent.displayName;
    } else {
      console.log(`  No intent matched.`);
      return;
    }
  }
  catch (e) {
    console.log(e)
  }
}
