const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');

const moment = require('moment');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');

const sequelize = require('./sequelize');
const authentication = require('./authentication');

const app = express(feathers());

// Load app configuration
app.configure(configuration());

// Set up Plugins and providers
app.configure(express.rest());
app.configure(sequelize);

app.configure(authentication);
// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.hooks(appHooks);

const calendarCronjob = async (app) => {
  const calendarEventsQuery = await app.service('cronjob-calendar-event').find({
    query: {
      joined: 0,
      status: 'confirmed',
      start: {
        $lte: moment().utc().add(3, 'minutes').toDate()
      },
      end: {
        $gte: moment().utc().toDate()
      }
    }
  })

  console.log(moment().utc().toDate(), calendarEventsQuery);
  const calendarEvents = calendarEventsQuery.data;

  for (let calendarEvent of calendarEvents) {
    await app.service('meeting-record').create({
      joinFromCronjobCalendar: true,
      room_url: calendarEvent.hangoutLink,
      user_id: calendarEvent.user_id,
      calendar_event_id: calendarEvent.id
    });
  }

  return process.exit();
}

calendarCronjob(app);
