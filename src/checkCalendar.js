const { get } = require('lodash');
const { Op } = require("sequelize");
const dayjs = require('dayjs');
const calendar = require('./calendar');
const axios = require('axios')

const updateToken = async (appCreds, user) => {
  try {
    const data = await axios.post(`https://www.googleapis.com/oauth2/v4/token`, {
      'client_id': appCreds.key,
      'client_secret': appCreds.secret,
      'refresh_token': user.gRefreshToken,
      'grant_type': 'refresh_token'
    });
    return data.data.access_token;
  }
  catch (e) {
    console.log('Failed update user token: ',e.message)
  }
}

const checkJob = async (app) => {
  try {
    const creds = app.get('authentication').oauth.google;
    console.log('Check user calendar <',dayjs().subtract(60, 'minute').toISOString())
    const { data: user } = await app.service('users').find({
      query: {
        LastCheck: {
          [Op.lte]: dayjs().subtract(60, 'minute').toISOString()
        },
        $limit: 100,
      }
    });
    for (let res of user) {
      console.log('dona debug')
      console.log(JSON.stringify(res))
      console.log('Before. user id: ', get(res, 'id'))
      if(res.gRefreshToken) {
        console.log('Process user id: ', get(res, 'id'))
        const authResult = await updateToken(creds, res);
        await calendar.handleUpdateCalendarEvent({ app, token: authResult, email: res.email, key: app.get('GOOGLE_API_KEY') , user_id: get(res, 'id')});
      }
     }
  } catch (e) {
    console.log('Check job error: ', e)
  }
}

module.exports = app => setInterval(() => checkJob(app), 1000 * 60);
