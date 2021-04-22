const get = require('lodash/get');
const convert = data => {
  const labels = get(data, 'results.speaker_labels.segments', []);
  const speaker_start_times = {};
  const speakers = [];
  labels.forEach((label) => {
    label.items.forEach(v => {
      speaker_start_times[v.start_time] = label.speaker_label;
      if (!speakers.includes(label.speaker_label)) {
        speakers.push(label.speaker_label);
      }
    });
  });


  // Now we iterate through items and build the transcript
  const items = data.results.items;
  const lines = [];
  const questions = []
  const speakTime = {};
  let line = '';
  let questionStartTime = '';
  let startTime = 0;
  let endTime = 0;
  let speaker = null;
  let current_speaker = null;
  items.forEach(item => {
    const content = item.alternatives[0].content;
    if (!content) {
      return;
    }

    if (item['start_time']) {
      current_speaker = speaker_start_times[item.start_time];
    } else if (item.type == 'punctuation') {

      line += content;
      if (content === '.') questionStartTime = endTime;
      if (content === '?') {
        const question = line.split('.')[line.split('.').length - 1].split('?')[line.split('.')[line.split('.').length - 1].split('?').length - 2] + '?';

        if (question.split(' ').length > 3) questions.push({
          'speaker': speaker,
          'question': question,
          'start_time': questionStartTime,
          'end_time': endTime,
        });
        questionStartTime = endTime;
      }


    }

    if (current_speaker != speaker) {
      if (!speakTime[current_speaker]) {
        speakTime[current_speaker] = { speaker: current_speaker, times: [] }
      }
      if (speaker) {
        speakTime[speaker].times.push({ startTime, endTime });
        lines.push({
          'speaker': speaker,
          'line': line,
          'start_time': startTime,
          'end_time': endTime,
        });
      }

      line = content;
      speaker = current_speaker;
      startTime = item.start_time;
      questionStartTime = item.start_time;
    } else if (item.type != 'punctuation') {
      line += ' ' + content;
      endTime = item.end_time;
    }
  });

  // Record the last line since there was no speaker change.
  if (speaker != null) {
    speakTime[speaker].times.push({ startTime, endTime })
    lines.push({
      'speaker': speaker,
      'line': line,
      'start_time': startTime,
      'end_time': endTime,
    });
  }
  return { lines, speakers, speakTime, questions };

};

module.exports = convert;