/* eslint-disable no-unused-vars */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const gmail = require('../../gmail');

class Service {
  constructor (options) {
    this.options = options || {};
  }

  async find (params) {
    return [];
  }

  async get (id, params) {
    return {
      id, text: `A new message with ID: ${id}!`
    };
  }

  async create (data, params) {
    const roomURL = data.room_url;
    const recordingId = data.record_id;
    const userId = data.user_id;
    const calendarEventId = data.calendar_event_id
    const autoAgentPath = path.join(__dirname,'./auto-agent');
    const detached = data.joinFromCronjobCalendar ? true : false;

    console.log('dona joinFromCronjobCalendar: ' +  data.joinFromCronjobCalendar)
    if (data.joinFromCronjobCalendar) {
      const stdoutStream = fs.openSync('./auto-agent.log', 'a');
      const stderrStream = fs.openSync('./auto-agent.log', 'a');
      console.log('dona data: ' +  roomURL + ' ' + autoAgentPath + ' ' + calendarEventId + ' ' + userId)

      spawn('node', [autoAgentPath,`room_url=${roomURL}`,`record_id=0`, `calendar_event_id=${calendarEventId}`, `user_id=${userId}`],{
        PATH: process.env.PATH,
        detached,
        stdio: [ 'ignore', stdoutStream, stderrStream ]
      }).unref();
    } else {
      console.log('dona data: ' +  roomURL + ' ' + autoAgentPath + ' ' + calendarEventId + ' ' + recordingId);

      const ls = spawn('node', [autoAgentPath,`room_url=${roomURL}`,`record_id=${recordingId}`],{
        PATH: process.env.PATH,
        detached
      });

      ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      ls.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });

      ls.on('error', (code) => {
        console.log(`child process exited with code ${code}`);
      });
    }

    return data;
  }

  async update (id, data, params) {
    return data;
  }

  async patch (id, data, params) {
    return data;
  }

  async remove (id, params) {
    return { id };
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
