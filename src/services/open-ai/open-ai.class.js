/* eslint-disable no-unused-vars */
const axios = require('axios');
const { client } = require('../../sqlClient');
const _ = require('lodash');

const sendGridService = require('./../../sendgrid');

function buildOpenAIBody(prompt) {
  return {
    prompt,
    temperature: 0,
    max_tokens: 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  };
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
    console.log(`dona questions: ${JSON.stringify(questions)}`);

    const openAIPromise = [];
    const processedData = [];

    let openAIItemCount = 0;
    let openAIPrompt = '';
    let openAIPromptTime = '';
    let openAITracking = [];

    for (let [i, item] of questions.entries()) {
      const { question, intent, answer, start_time: time } = item;
      if(_.includes(_.lowerCase(intent), 'spend categories')) {
        if(openAIItemCount >= 6) {
          openAIPromise.push(postAxios(buildOpenAIBody(openAIPrompt)));
          openAITracking.push({
            time: openAIPromptTime * 1 || 0,
            question: openAIPrompt
          });

          openAIItemCount = 0;
          openAIPrompt = '';
          openAIPromptTime = time;
        }

        openAIPrompt += question + ' ';
        openAIItemCount++;
      } else {
        if(openAIPrompt) {
          openAIPromise.push(postAxios(buildOpenAIBody(openAIPrompt)));
          openAITracking.push({
            time: openAIPromptTime * 1 || 0,
            question: openAIPrompt
          });

          openAIItemCount = 0;
          openAIPrompt = '';
          openAIPromptTime = time;
        }

        processedData.push({
          question,
          intent,
          answer,
          time: time * 1 || 0,
        });
      }
    }

    if(openAIPrompt) {
      openAIPromise.push(postAxios(buildOpenAIBody(openAIPrompt)));
      openAITracking.push({
        time: openAIPromptTime * 1 || 0,
        question: openAIPrompt
      });
    }

    let openAIResponse, openAIResponseSub;
    try {
      openAIResponse = await Promise.all(openAIPromise);
      openAIResponseSub = await Promise.all(openAIPromise);
    } catch (e) {
      console.log(e.message)
    }


    console.log(`recoding id: ${recordingId} - openai result: ${JSON.stringify(openAIResponse)} - - openai result 2: ${JSON.stringify(openAIResponseSub)}`);
    console.log(`question: ${openAIPrompt}`);

    // eslint-disable-next-line max-len
    const processOpenAI = _.map(openAIResponse, async (v, i) => {
      const obj = {
        intent: v.object, answer: _.get(v, 'choices.0.text') || _.get(openAIResponseSub[i], 'choices.0.text'), ...openAITracking[i]
      };

      return obj;
    });

    return _.sortBy([...processedData, ...processOpenAI],'time');
  }

  async getClientEmail({
    recordingId
  }) {
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
    const recording = await app.service('recording').find({
      query: {
        id: recordingId,
        send_mail_analyze: 0
      },
      raw: true
    });
    console.log('dona recording found: ' + JSON.stringify(recording))

    if(recording && recording[0]) {
      console.log('dona enter recording: ')

      const [resultMeeting, emails] = await Promise.all([
        this.processingData({ recordingId }),
        this.getClientEmail({recordingId})
      ]) ;

      if(emails && emails[0] && resultMeeting && resultMeeting[0]) {
        await new sendGridService().sendAnalyzeMeeting({ data: resultMeeting, emails });
      }

      await app.service('recording').patch(recordingId, { send_mail_analyze: 1 });
    }
  }
}

module.exports = function (options) {
  return new Service(options);
};
