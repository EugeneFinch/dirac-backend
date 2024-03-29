const get = require('lodash/get');
const dialogFlow = require('./../../dialogFlow');
const { getKeywordCriteria } = require('./../../services/transcript/utils');
const env = process.env.NODE_ENV || 'dev';

const answer = async (app, data, context, speakers, speakerIds, id, qId, keywordCriteria) => {
  if(!data) {
    return;
  }

  let str = data.line;
  while (str.toString().length > 250) {
    str = str.toString().split(',');
    str.shift();
  }

  const textToAnalyze = str.toString() === '[]' ? '' : str.toString();
  const [answer, isQuestion] = await (env === 'prod' ? dialogFlow.comparingKeywordRecapConfig({
    textToAnalyze,
    keywordCriteria
  }) : dialogFlow(str, context));

  console.log('test new logic: is answering: ' + JSON.stringify(data));
  console.log('test new logic response: ' + JSON.stringify(answer));

  if (answer && (answer.intent.displayName || answer.queryText)) {
    const speakerIdx = speakers.findIndex(v => v === data.speaker);
    await app.service('answer').create({
      speaker_id: get(speakerIds, `${speakerIdx}.id`),
      recording_id: id,
      question_id: qId,
      answer: str,
      intent: answer.intent.displayName,
      intent_info: env === 'prod' ? answer.intent.code : answer,
      start_time: data.start_time,
      end_time: data.end_time,
    });
  }
}

const DFLogic = async (app, data, speakers, speakerIds, id) => {
  const keywordCriteria = await getKeywordCriteria({ app });

  let skipNextPassage = 0;
  for (let i in data) {
    if (/\?/gim.test(data[i].line) && !skipNextPassage) {
      let questionsData = data[i].line.match(/([A-z 0-9,@#$\-%^&'*()]+\?)/gim)
      questionsData = questionsData.filter(res => res.split(' ').length > 3).map(res => {
        let str = res.toString().trim();


        while (str.toString().length > 250) {
          str = str.toString().split(',');
          str.shift();
        }
        return str.toString().trim();
      });


      for (let b in questionsData) {
        if (+b + 1 < questionsData.length) {
          const regexp = new RegExp(`(?:${questionsData[+b].replace('?', '\\?')})([A-z0-9'?,$%\\- .]+)(?:${questionsData[+b + 1].replace('?', '\\?')})`, 'gim')
          const res = regexp.exec(data[i].line)
          if (Array.from(res)[1].length <= 10) {
            questionsData[b] = questionsData[b] + questionsData[+b + 1];
            delete questionsData[+b + 1]
          }
          questionsData = questionsData.filter(el => el != null);
        }


      }

      for (let question in questionsData) {
        const textToAnalyze = questionsData[question].toString().toLowerCase();

        const [response, isQuestion] = await (env === 'prod' ? dialogFlow.comparingKeywordRecapConfig({
          textToAnalyze,
          keywordCriteria
        }) : dialogFlow(textToAnalyze));

        console.log('test new logic is questioning: ' + JSON.stringify(data[i]));
        console.log('test new logic response: ' + JSON.stringify(response));

        if (response && (response.intent.displayName || response.queryText)) {
          const speakerIdx = speakers.findIndex(v => v === data[i].speaker);

          const qId = await app.service('question').create({
            speaker_id: get(speakerIds, `${speakerIdx}.id`),
            recording_id: id,
            question: questionsData[question],
            intent: response.intent.displayName,
            intent_info: env === 'prod' ? response.intent.code : response,
            start_time: data[i].start_time,
            end_time: data[i].end_time,
          })

          const nextData = env === 'prod' && !isQuestion ? data[i] : data[+i + 1]

          if (env === 'prod' && !isQuestion) {
            console.log('test new logic: it looks like answer than question');
          }

          await answer(app, nextData, response.outputContexts, speakers, speakerIds, id, qId.id, keywordCriteria)
        }
      }

    }


    else if (data[i].line.split(' ').length > 3 && !skipNextPassage) {
      const processed = data[i].line.split('.');
      let idx;
      for (let i = processed.length - 1; i >= 0 && !idx; i--) {
        if (processed[i].split(' ').length > 3) idx = i
      }
      if (idx !== undefined) {
        let str = processed[idx].toString().trim() + '?';
        while (str.toString().length > 250) {
          str = str.toString().split(',');
          str.shift();
        }

        const textToAnalyze = str.toString().trim();
        const [response, isQuestion] = await (env === 'prod' ? dialogFlow.comparingKeywordRecapConfig({
          textToAnalyze,
          keywordCriteria
        }) : dialogFlow(textToAnalyze));


        console.log('test new logic: is questioning: ' + JSON.stringify(data[i]));
        console.log('test new logic response: ' + JSON.stringify(response));

        if (response && (response.intent.displayName || response.queryText)) {
          const speakerIdx = speakers.findIndex(v => v === data[i].speaker);

          const qId = await app.service('question').create({
            speaker_id: get(speakerIds, `${speakerIdx}.id`),
            recording_id: id,
            question: str.toString().trim(),
            intent: response.intent.displayName,
            intent_info: env === 'prod' ? response.intent.code : response,
            start_time: data[i].start_time,
            end_time: data[i].end_time,
          });

          const nextData = env === 'prod' && !isQuestion ? data[i] : data[+i + 1]

          if (env === 'prod' && !isQuestion) {
            console.log('test new logic: it looks like answer than question');
          }

          await answer(app, nextData, response.outputContexts, speakers, speakerIds, id, qId.id, keywordCriteria)
        }

      }
    }
  }

};

module.exports = DFLogic;
