/* eslint-disable no-unused-vars */
const axios = require('axios');
const { client } = require('../../sqlClient');
const _ = require('lodash');

const sendGridService = require('./../../sendgrid');

function buildOpenAIBody(prompt) {
  const obj = {
    prompt: prompt + ' \n\nPlease make a table summarizing the expense categories: \n| utilities| 4000 $ \n| salary| zero',
    temperature: 0,
    max_tokens: 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop: ["\n\n"]
  };
  console.log(`openai request: ${JSON.stringify(prompt)}`);
  return obj;
}

async function postAxios(body) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk-dzjz0BfFLmgOD3aCypp0Xfow4qxZ9pUcEVM3wNTz'
  };

  const res = await axios.post('https://api.openai.com/v1/engines/davinci/completions', body, {
    headers: headers
  });

  if(res && res.status == 200) {
    return res.data;
  }

  console.log(`openai error: ${JSON.stringify(res)}`);
}

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
    return {};
  }

  async processingData({
    recordingId
  }) {
    const query = `SELECT q.question, q.intent, q.start_time, a.answer FROM question AS q JOIN speaker AS s
    ON q.speaker_id = s.id AND s.team_member = TRUE
    LEFT JOIN answer AS a ON a.question_id = q.id
    WHERE q.recording_id=${recordingId} AND q.intent != 'Default Fallback Intent'`;

        // debug
//     const query = `SELECT q.question, q.intent, q.start_time, a.answer FROM question AS q JOIN speaker AS s
// ON q.speaker_id = s.id AND s.team_member = TRUE
// LEFT JOIN answer AS a ON a.question_id = q.id
// WHERE q.intent != 'Default Fallback Intent'`;

    const questions = await client.query(query);
    console.log(`openai filter database: ${JSON.stringify(questions)}`);

    const openAIPromise = [];
    const processedData = [];

    let openAITracking = {
      itemCount: 0,
      prompt: '',
      promptTime: 0,
      arr: [],
      intent: ''
    }

    for (let [i, item] of questions.entries()) {
      const { question, intent, answer, start_time: time } = item;

      if(_.includes(_.lowerCase(intent), 'spend categories')) {
        if (openAITracking.itemCount >= 6) {
          openAIPromise.push(postAxios(buildOpenAIBody(openAITracking.prompt)));
          openAITracking.arr.push({
            time: openAITracking.promptTime * 1 || 0,
            question: openAITracking.prompt,
            intent: openAITracking.intent
          });

          openAITracking.itemCount = 0;
          openAITracking.prompt = '';
          openAITracking.promptTime = time;
        }

        openAITracking.prompt += answer + ' ';
        openAITracking.itemCount++;
        openAITracking.intent = intent;
      } else {
        if (openAITracking.prompt) {
          openAIPromise.push(postAxios(buildOpenAIBody(openAITracking.prompt)));
          openAITracking.arr.push({
            time: openAITracking.promptTime * 1 || 0,
            question: openAITracking.prompt,
            intent: openAITracking.intent
          });

          openAITracking.itemCount = 0;
          openAITracking.prompt = '';
          openAITracking.promptTime = time;
        }

        processedData.push({
          question,
          intent,
          answer,
          time: time * 1 || 0,
        });
      }
    }

    if (openAITracking.prompt) {
      openAIPromise.push(postAxios(buildOpenAIBody(openAITracking.prompt)));
      openAITracking.arr.push({
        time: openAITracking.promptTime * 1 || 0,
        question: openAITracking.prompt,
        intent: openAITracking.intent
      });
    }

    const openAIResponse = await Promise.all(openAIPromise);
    const openAIResponseSub = await Promise.all(openAIPromise);
    console.log(`recoding id: ${recordingId} - openai response: ${JSON.stringify(openAIResponse)} - - openai response 2: ${JSON.stringify(openAIResponseSub)}`);

    // eslint-disable-next-line max-len
    const processOpenAI = _.map(openAIResponse, (v, i) => {
      const obj = {
        answer: _.get(v, 'choices.0.text') || _.get(openAIResponseSub[i], 'choices.0.text'), ...openAITracking.arr[i]
      };

      return obj;
    });

    return _.sortBy([...processedData, ...processOpenAI],'time');
  }

  async getClientEmail({
    recordingId
  }) {
    return ["eu.bochkov@gmail.com", "nhtrung13clc@gmail.com"];

    const query = `
SELECT c.attendees FROM recording AS r JOIN calendar_event AS c ON c.id = r.calendar_event_id AND r.id=${recordingId};`;
    const result = await client.query(query);

    if(!result || !result[0]) {
      return;
    }

    const {attendees} = result[0];

    const parseAttendees = JSON.parse(attendees);
    if(!parseAttendees || !parseAttendees[0]) {
      return;
    }

    return _.map(parseAttendees, v => v.email);
  }

  async handleSendMailAfterMeeting(app, recordingId) {
    const query = `
    SELECT id, subject FROM recording WHERE send_mail_analyze = 0 AND id=${recordingId};`;
    const recording = await client.query(query);

    console.log('dona recording found: ' + JSON.stringify(recording))

    if(recording && recording[0]) {
      console.log('dona enter recording: ')

      const [resultMeeting, emails] = await Promise.all([
        this.processingData({ recordingId }),
        this.getClientEmail({recordingId})
      ]) ;
      console.log(resultMeeting)
      if(emails && emails[0] && resultMeeting && resultMeeting[0]) {
        await new sendGridService().sendAnalyzeMeeting({ data: resultMeeting, emails, recordingId, subject: recording[0].subject });
      }

      await app.service('recording').patch(recordingId, { send_mail_analyze: 1 });
    }
  }
}

module.exports = function (options) {
  return new Service(options);
};
