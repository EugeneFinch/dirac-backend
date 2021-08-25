const get = require('lodash/get');
const dialogFlow = require('./../../dialogFlow');


const answer = async (app, data, context, speakers, speakerIds, id, qId) => {
  if(!data) {
    return;
  }

  let str = data.line;
  while (str.toString().length > 250) {
    str = str.toString().split(',');
    str.shift();
  }
  str = str.toString();
  const answer = await dialogFlow(str, context);
  if (answer && answer.queryText) {
    const speakerIdx = speakers.findIndex(v => v === data.speaker);
    await app.service('answer').create({
      speaker_id: get(speakerIds, `${speakerIdx}.id`),
      recording_id: id,
      question_id: qId,
      answer: str,
      intent: answer.intent.displayName,
      intent_info: answer,
      start_time: data.start_time,
      end_time: data.end_time,
    });
    console.log('answer', )
  }
}

const DFLogic = async (app, data, speakers, speakerIds, id) => {

  let skipNextPassage = 0;
  for (let i in data) {
    // console.log('------------------------------------------------')
    // console.log('q ', data[i]);
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
        const response = await dialogFlow(questionsData[question])
        // console.log('question ', questionsData[question])
        // console.log('response ', response)
        if (response && response.queryText) {
          const speakerIdx = speakers.findIndex(v => v === data[i].speaker);
          const qId = await app.service('question').create({
            speaker_id: get(speakerIds, `${speakerIdx}.id`),
            recording_id: id,
            question: questionsData[question],
            intent: response.intent.displayName,
            intent_info: response,
            start_time: data[i].start_time,
            end_time: data[i].end_time,
          })

          await answer(app, data[+i + 1], response.outputContexts, speakers, speakerIds, id, qId.id)
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

        const response = await dialogFlow(str.toString().trim());
        // console.log('question without ? ', str.trim())
        // console.log('response ', response) // Последний предложение без вопросов
        if (response && response.queryText) {
          const speakerIdx = speakers.findIndex(v => v === data[i].speaker);
          const qId = await app.service('question').create({
            speaker_id: get(speakerIds, `${speakerIdx}.id`),
            recording_id: id,
            question: str.toString().trim(),
            intent: response.intent.displayName,
            intent_info: response,
            start_time: data[i].start_time,
            end_time: data[i].end_time,
          });
          await answer(app, data[+i + 1], response.outputContexts, speakers, speakerIds, id, qId.id)
        }

      }
    }
  }

};

module.exports = DFLogic;
