const get = require('lodash/get');

module.exports = async function (ctx) {
  console.log(ctx.data)
  const rec = ctx.result.data;
  const sequelize = ctx.app.get('sequelizeClient');
  const { calendar_event } = sequelize.models;

  for (let i in ctx.result.data) {
    if (ctx.result.data[i].calendar_event_id) {
      console.log(i);
      ctx.result.data[i].record = {}
      const record = (await calendar_event.findOne({ where: { id: ctx.result.data[i].calendar_event_id } })).dataValues;
      const organailer = JSON.parse(record.attendees).map(res => {
        if(res.organizer) return res.email;
      }).filter(el => el).toString();
      const data = {
        users: JSON.parse(record.attendees).length,
        org: organailer,
        accName: organailer.split('@')[0]
      }
      ctx.result.data[i].record = data;
    }
  }
};