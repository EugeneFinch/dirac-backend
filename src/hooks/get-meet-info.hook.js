const get = require('lodash/get');
const { client } = require('../sqlClient');

module.exports = async function (ctx) {
  const sequelize = ctx.app.get('sequelizeClient');
  const { calendar_event } = sequelize.models;
  console.log('ctx.result', ctx.result, '\n\n\n')
  if (ctx.result.data) {
    for (let i in ctx.result.data) {

      const users = await client.query(`select name from speaker where id in (select speaker_id from transcript where recording_id = ${ctx.result.data[i].id} group by speaker_id) group by name`)
      console.log(users)
      const data = {
        users: users,
        // org: organailer,
        // accName: organailer.split('@')[0]
      }
      ctx.result.data[i].record = data;
      // if (ctx.result.data[i].calendar_event_id) {
      //   console.log(i);
      //   ctx.result.data[i].record = {}
      //   const record = (await calendar_event.findOne({ where: { id: ctx.result.data[i].calendar_event_id } })).dataValues;
      //   const organailer = record.attendees ? JSON.parse(record.attendees).map(res => {
      //     if (res.organizer) return res.email;
      //   }).filter(el => el).toString() : '';
      //   const data = {
      //     users: record.attendees,
      //     org: organailer,
      //     accName: organailer.split('@')[0]
      //   }
      //   ctx.result.data[i].record = data;
      // }
    }
  } else if (ctx.result) {
    const users = await client.query(`select name from speaker where id in (select speaker_id from transcript where recording_id = ${ctx.result.id} group by speaker_id) group by name`)
    const data = {
      users: users,
      // org: organailer,
      // accName: organailer.split('@')[0]
    }
    ctx.result.record = data;


  //   if (ctx.result.calendar_event_id) {
  //     ctx.result.record = {}
  //     const record = (await calendar_event.findOne({ where: { id: ctx.result.calendar_event_id } })).dataValues;
  //     const organailer = record.attendees ? JSON.parse(record.attendees).map(res => {
  //       if (res.organizer) return res.email;
  //     }).filter(el => el).toString() : '';
  //     const data = {
  //       users: record.attendees,
  //       org: organailer,
  //       accName: organailer.split('@')[0]
  //     }
  //     ctx.result.record = data;
  //   }
  }
};