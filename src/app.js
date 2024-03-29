const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const helmet = require('helmet');
const logger = require('./logger');

const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');



const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');

const sequelize = require('./sequelize');
const { connect } = require('./sqlClient');
const {watchInbox,authorize} = require('./gmail');
const authentication = require('./authentication');
const checkCalendar = require('./checkCalendar');

const app = express(feathers());
app.configure(socketio(require('./socketio')));

// Load app configuration
app.configure(configuration());
// Enable security, CORS, compression, favicon and body parsing
app.use(helmet());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.use('/', express.static(app.get('public')));

// Set up Plugins and providers
app.configure(express.rest());


app.configure(sequelize);
app.configure(connect);

//Watch agent mail inbox
watchInbox(app.get('MAIL_INBOX_TOPIC'),authorize(app));
//Refresh daily
setInterval(()=>watchInbox(app.get('MAIL_INBOX_TOPIC'),authorize(app)),24*60*60*1000);
// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);

app.configure(authentication);
app.configure(checkCalendar);

// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));

app.hooks(appHooks);

module.exports = app;
