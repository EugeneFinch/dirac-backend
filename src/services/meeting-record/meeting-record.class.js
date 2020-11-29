/* eslint-disable no-unused-vars */
const path = require('path');
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
    let message = data.message.data;
    let buff = Buffer.from(message, 'base64');  
    message = JSON.parse(buff.toString('utf-8')); 
    const historyId = message.historyId;
    const auth = gmail.authorize();
    const roomURL = await gmail.getRoomURL(auth,historyId);
    if(!roomURL){
      console.log(`No room url found ${historyId}`);
      return { message: `No room url found for history ${historyId}`};
    }

    const autoAgentPath = path.join(__dirname,'./auto-agent');
    console.log('roomURL', roomURL);
    const ls = spawn('node', [autoAgentPath,`room_url=${roomURL}`],{
      PATH: process.env.PATH
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
