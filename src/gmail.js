const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
const CREDENTIAL_PATH = path.join(__dirname,'../config/dirac-296815-b32c0222cbfe.json');

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
watchInbox(authorize());
function authorize() {
  const content = fs.readFileSync(CREDENTIAL_PATH);
  const credentials = JSON.parse(content);

  const {client_secret, client_id, redirect_uris} = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  try{
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  }catch(err) {
    return getNewToken(oAuth2Client);
  }
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 */
function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      return oAuth2Client;
    });
  });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function watchInbox(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.watch({
    userId: 'me',
    requestBody:{
      topicName:'projects/dirac-296815/topics/mail-inbox',
      labelIds:['INBOX']
    }
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    console.log('res', res);
   
  });
}
async function getInviteInfo (auth,startHistoryId) {
  const gmail = google.gmail({version: 'v1', auth});
  const result = {
    host:'',
    roomURL:''
  };

  try{
    const history = await gmail.users.history.list({
      userId:'me',
      labelIds:['INBOX'],
      startHistoryId,
      historyTypes:'MESSAGE_ADDED',
      maxResults:1
    });

    if(!history.data.history){
      console.log('NO HISTORY');
      return;
    }

    const messageId = history.data.history[0].messages[0].id;
    const message = await gmail.users.messages.get({
      userId:'me',
      id:messageId
    });
  
    const roomRegex = /meet.google.com\/(\w|-)+/g;
    const roomURL = roomRegex.exec(message.data.snippet);
    const hostRegex = /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/g;
    const host = hostRegex.exec(message.data.snippet);
    if(!roomURL || !host){
      return result;
    }

    result.roomURL = `https://${roomURL[0]}`;
    result.host = host[0];
    return result;
  }catch(err) {
    console.log('err', err);
    throw err;
  }
 
}

module.exports = {
  authorize,
  getInviteInfo,
};