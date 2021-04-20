const get = require('lodash/get');
const { client } = require('../sqlClient');

module.exports = async function (ctx) {
  if (ctx.result.data) {
    for (let i in ctx.result.data) {

      const users = await client.query(`select name from speaker where id in (select speaker_id from transcript where recording_id = ${ctx.result.data[i].id} group by speaker_id) group by name`)
      console.log(users)
      const data = {
        users: users,
      }
      ctx.result.data[i].record = data;
    }
  } else if (ctx.result) {
    const users = await client.query(`select user_name as name from speakers_data where recordingId = ${ctx.result.id} group by user_name`)
    const data = {
      users: users,
    }
    ctx.result.record = data;
  }
};