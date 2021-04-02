const get = require('lodash/get');

module.exports = async function (ctx) {
  const sequelize = ctx.app.get('sequelizeClient');
  const { calendar_event } = sequelize.models;
  if (ctx.result.data) {
    for (let i in ctx.result.data) {
      if (ctx.result.data[i].calendar_event_id) {
        console.log(i);
        ctx.result.data[i].record = {}
        const record = (await calendar_event.findOne({ where: { id: ctx.result.data[i].calendar_event_id } })).dataValues;
        const organailer = JSON.parse(record.attendees).map(res => {
          if (res.organizer) return res.email;
        }).filter(el => el).toString();
        const data = {
          users: record.attendees,
          org: organailer,
          accName: organailer.split('@')[0]
        }
        ctx.result.data[i].record = data;
      }
    }
  } else if (ctx.result) {
    if (ctx.result.calendar_event_id) {
      ctx.result.record = {}
      const record = (await calendar_event.findOne({ where: { id: ctx.result.calendar_event_id } })).dataValues;
      const organailer = JSON.parse(record.attendees).map(res => {
        if (res.organizer) return res.email;
      }).filter(el => el).toString();
      const data = {
        users: record.attendees,
        org: organailer,
        accName: organailer.split('@')[0]
      }
      ctx.result.record = data;
    }
  }
};