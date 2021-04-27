/* eslint-disable no-unused-vars */
const AWS = require('aws-sdk');
const fs = require('fs');
const https = require('https');
const { client } = require('../../sqlClient')
const SrtConvert = require('./srtConvert');
const get = require('lodash/get');
const path = require('path');
const env = process.env.NODE_ENV || 'dev';

const transform = (s3File, jobName) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(process.cwd(), `./uploads/${jobName}.json`);
    const file = fs.createWriteStream(filePath);
    console.log('s3File', s3File)
    https.get(s3File, response => {
      var stream = response.pipe(file);
      stream.on('finish', function () {
        const string = fs.readFileSync(filePath);
        const lines = SrtConvert(JSON.parse(string));
        return resolve(lines);
      });
    });
  });
};

class Service {
  constructor(options) {
    this.options = options || {};
  }

  async find(params) {
    return [];
  }

  async get(id, params) {
    return {
      id, text: `A new message with ID: ${id}!`
    };
  }

  async create(data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    return data;
  }


  async update(id, data, params) {
    const transcribeservice = new AWS.TranscribeService({
      accessKeyId: this.options.app.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.options.app.get('AWS_SECRET_ACCESS_KEY'),
      region: 'ap-southeast-1'
    });
    const job = { TranscriptionJobName: `dirac-${env}-${id}` };
    const rep = await transcribeservice.getTranscriptionJob(job).promise();
    const s3File = rep.TranscriptionJob.Transcript.RedactedTranscriptFileUri; // поменяй  !!! TranscriptFileUri -> RedactedTranscriptFileUri
    const status = rep.TranscriptionJob.TranscriptionJobStatus;
    const jobName = rep.TranscriptionJob.TranscriptionJobName;
    await this.options.app.service('recording').patch(id, { status });
    if (status !== 'COMPLETED') {
      return;
    }
    const { lines, speakers, speakTime, questions } = await transform(s3File, jobName);
    console.log('\n\n', "speakTime\n", JSON.stringify(speakTime), '\n\n')
    for (const i in speakTime) {
      console.log('select', `SELECT sum(end-start) as duration, user_name FROM speakers_data where end-start > 5 and recordingId = ${id}
      and (${speakTime[i].times.map(res => `start between ${parseFloat(res.startTime) - 0.3} and ${parseFloat(res.endTime) + 0.3}`)
          .toString().replace(/,/gim, ' or ')}) group by user_name order by sum(end-start) DESC`, '\n\n\n')

      //     `select start.user_name as user_name, start.count+end.count as entries_match FROM 
      // (select user_name, count(*) as count from speakers_data where end-start > 0.1 and recordingId = ${id} and
      // (${speakTime[i].times.map(res => `start between ${parseFloat(res.startTime) - 0.2} and ${parseFloat(res.endTime) + 0.3}`)
      //     .toString().replace(/,/gim, ' or ')})
      // group by user_name order by count(*) DESC limit 1) as start,

      // (select user_name, count(*) as count from speakers_data where end-start > 0.1 and recordingId = ${id} and
      // (${speakTime[i].times.map(res => `end between ${parseFloat(res.endTime) - 0.2} and ${parseFloat(res.endTime) + 0.3}`)
      //     .toString().replace(/,/gim, ' or ')}) group by user_name order by count(*) DESC limit 1) as end
      //     WHERE start.user_name = end.user_name`

      let users = await client.query(`SELECT sum(end-start) as duration, user_name FROM speakers_data where end-start > 5 and recordingId = ${id}
        and (${speakTime[i].times.map(res => `start between ${parseFloat(res.startTime) - 0.3} and ${parseFloat(res.endTime) + 0.3}`)
          .toString().replace(/,/gim, ' or ')}) group by user_name order by sum(end-start) DESC
      `)
      if (!users[0]) users = await client.query(`SELECT sum(end-start) as duration, user_name FROM speakers_data where end-start > 2 and recordingId = ${id}
      and (${speakTime[i].times.map(res => `start between ${parseFloat(res.startTime) - 0.3} and ${parseFloat(res.endTime) + 0.3}`)
          .toString().replace(/,/gim, ' or ')}) group by user_name order by sum(end-start) DESC
    `)
      if (users[0]) {
        speakTime[i].speaker = users[0].user_name ? users[0].user_name : null;
      } else {
        await client.query(`INSERT INTO speakers_data (recordingId, user_name, start, end) VALUES (${id}, '${speakTime[i].speaker}' ,0,0)`)
        speakTime[i].speaker = null;
      }

      speakTime[i].team_member = 0;
      if (speakTime[i].speaker) {
        console.log('speakTime[i].speaker', speakTime[i].speaker)
        console.log('team_id  ', `select team_id from team_user where user_id = (select user_id from recording where id = ${id})`)
        const team_id = await client.query(`select team_id from team_user where user_id = (select user_id from recording where id = ${id})`);
        if (team_id[0]) {
          const id = await client.query(`select id from user where id in (select user_id
            from team_user
            where team_id = ${team_id[0].team_id}) and gDisplayName = '${speakTime[i].speaker}';`)
          console.log('user_id   ', `select id from user where id in (select user_id
              from team_user
              where team_id = ${team_id[0].team_id}) and gDisplayName = '${speakTime[i].speaker}';`, 'id', id, '\n\n\n')
          if (id[0]) speakTime[i].team_member = 1;
        } else {
          const id = await client.query(`select id from user where id = (select user_id from recording where id = {id}) and gDisplayName = '${speakTime[i].speaker}';`)
          if (id[0]) speakTime[i].team_member = 1;
        }
      }
    }
    // return true
    const speakerIds = await this.options.app.service('speaker').create(speakers.map(v => ({ name: speakTime[v].speaker || v, team_member: speakTime[v].team_member })));

    const questionsInsertData = questions.map(res => {
      const speakerIdx = speakers.findIndex(v => v === res.speaker);
      return {
        speaker_id: get(speakerIds, `${speakerIdx}.id`),
        recording_id: id,
        question: res.question,
        start_time: res.start_time,
        end_time: res.end_time,
      };
    })
    await this.options.app.service('question')._remove(null, {
      query: {
        recording_id: id
      }
    });
    await this.options.app.service('question').create(questionsInsertData);
    const insertData = lines.map(l => {
      const speakerIdx = speakers.findIndex(v => v === l.speaker);
      return {
        speaker_id: get(speakerIds, `${speakerIdx}.id`),
        recording_id: id,
        content: l.line,
        search_content: l.line.toLowerCase(),
        start_time: l.start_time,
        end_time: l.end_time,
      };
    });
    const transcript = await this.options.app.service('transcript')._find({
      query: {
        $limit: 1,
        recording_id: id
      }
    });

    if (transcript.total > 0) {
      await this.options.app.service('transcript')._remove(null, {
        query: {
          recording_id: id
        }
      });
    }

    await this.options.app.service('transcript').create(insertData);
    await this.options.app.service('transcript-coaching').create({ recording_id: id });

    return { message: 'done' };

  }

  async patch(id, data, params) {
    return data;
  }

  async remove(id, params) {
    return { id };
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
