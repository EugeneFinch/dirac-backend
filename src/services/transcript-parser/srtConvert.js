const get = require('lodash/get');
const convert = data => {
  const labels  = get(data,'results.speaker_labels.segments',[]);
  const speaker_start_times = {};
  const speakers = [];
  labels.forEach((label)=>{
    label.items.forEach( v=>{
      speaker_start_times[v.start_time] = label.speaker_label;
      if(!speakers.includes(label.speaker_label)){
        speakers.push(label.speaker_label);
      }
    });
  });


  // Now we iterate through items and build the transcript
  const items = data.results.items;
  const lines = [];
  let line = '';
  let time = 0;
  let speaker = null;
  let current_speaker = null;
  items.forEach(item=>{
    const content = item.alternatives[0].content;
    if(!content){
      return;
    }
    
    if (item['start_time']) {
      current_speaker = speaker_start_times[item.start_time];
    }

    else if (item.type == 'punctuation') {
      line += content;
    }
  
    if (current_speaker != speaker) {
      if (speaker) {
        lines.push({
          'speaker' : speaker,
          'line' : line,
          'time' : time,
        });
      }

      line = content;
      speaker = current_speaker;
      time = item.start_time;
    }

    else if (item.type != 'punctuation') {
      line += ' ' + content;
    }
  });

  // Record the last line since there was no speaker change.
  if(speaker!=null){
    lines.push({
      'speaker' : speaker,
      'line' : line,
      'time' : time,
    });
  }
 
  return {lines,speakers};

};

module.exports  = convert;