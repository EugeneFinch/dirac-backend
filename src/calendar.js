const axios = require('axios');

function watchCalendar({ token, email, id }) {
  axios(`https://www.googleapis.com/calendar/v3/calendars/${email}/events/watch`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: {
      id, // Your channel ID.
      type: "web_hook",
      address: "https://api.diracnlp.com/calendar-event", // Your receiving URL.
      // "token": "target=myApp-myCalendarChannelDest", // (Optional) Your channel token.
      // "expiration": 1426325213000 // (Optional) Your requested channel expiration time.
    }
  })
    .then(() => console.log('push watch calendar success'))
    .catch(error => {
      if (error.response) {
        // Request made and server responded
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
    })
}

function getEventList({ token, email, key }) {
  return axios(`https://www.googleapis.com/calendar/v3/calendars/${email}/events`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    params: {
      key,
      maxResults: 50,
      timeMin: new Date().toISOString(),
      // singleEvents: true
    }
  })
}



module.exports = {
  watchCalendar,
  getEventList
};