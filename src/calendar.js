const axios = require('axios');
const dayjs = require('dayjs');
const { get, forEach } = require('lodash');

function watchCalendar({ token, email, id, resourceId }) {
  return axios(`https://www.googleapis.com/calendar/v3/calendars/${email}/events/watch`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: {
      id, // Your channel ID.
      type: 'web_hook',
      address: 'https://api.diracnlp.com/calendar-event', // Your receiving URL.
      token, // (Optional) Your channel token.
      // "expiration": 1426325213000 // (Optional) Your requested channel expiration time.
    }
  })
    .then(data => {
      console.log('push watch calendar success: ' + id);
      return data;
    })
    .catch(error => {
      console.log('push watch calendar error: ' + id);
      if (error.response) {
        // Request made and server responded
        //console.log(error.response.data);
        //console.log(error.response.status);
        //console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        //console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        //console.log('Error', error.message);
      }
      return null;
    });
}

function getEventList({ token, email, key, syncToken }) {
  let params = {
    key,
    maxResults: 10000,
    timeMax: dayjs().add(7, 'day').toISOString(),
    timeMin: dayjs().toISOString(),
    singleEvents: true,
  };

  if (syncToken) {
    params = {
      key,
      syncToken
    };
  }

  return axios(`https://www.googleapis.com/calendar/v3/calendars/${email}/events`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    params
  });
}

async function handleUpdateCalendarEvent({ app, token, email, key, syncToken, user_id }) {
  return 0;
  const db = app.get('sequelizeClient');
  try {
    const response = await getEventList({ token, email, key, syncToken });

    let items = get(response, 'data.items');
    const nextSyncToken = get(response, 'data.nextSyncToken');

    await app.service('users').patch(user_id, { nextSyncToken });

    forEach(items, item => {
      const params = {
        id: item.id,
        kind: item.kind,
        etag: item.etag,
        status: item.status,
        htmlLink: item.htmlLink,
        created: item.created,
        creator: get(item, 'creator.email', ''),
        updated: item.updated,
        summary: item.summary,
        location: item.location,
        time_zone: get(item, 'start.timeZone', ''),
        user_id,
        attendees: JSON.stringify(item.attendees),
        start: get(item, 'start.dateTime', ''),
        end: get(item, 'end.dateTime', ''),
        description: item.description,
        hangoutLink: item.hangoutLink,
      };
      db.models.calendar_event.upsert(params)
        .then(o => console.log('upsert success'))
        .catch(e => console.log('upsert error', e));
    });
    await app.service('users').patch(user_id, { lastCheck: dayjs().toISOString() });
  } catch (error) {
    console.log('asdjkfhnsda', error.message);
  }
}

module.exports = {
  watchCalendar,
  getEventList,
  handleUpdateCalendarEvent
};
