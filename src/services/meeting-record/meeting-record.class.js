/* eslint-disable no-unused-vars */
const path = require('path');
const { spawn } = require('child_process');

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
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }


    const autoAgentPath = path.join(__dirname,'./auto-agent');
    const ls = spawn('node', [autoAgentPath,`room_url=${data.room_url}`],{
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
