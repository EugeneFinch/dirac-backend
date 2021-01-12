const get = require('lodash/get');
const maxBy = require('lodash/maxBy');
const keyBy = require('lodash/keyBy');
const uniq = require('lodash/uniq');
const Sequelize = require('sequelize');

const Op = Sequelize.Op;

const getTeamTalkTime = async (ctx)=> {
  const transcript = get(ctx,'data.transcript');
  if(!transcript){
    return null;
  }

  const sequelize = ctx.app.get('sequelizeClient');
  const {speaker } = sequelize.models;
  const speakerIds = uniq(transcript.map(v=>v.speaker_id));

  const speakers = await speaker.findAll({
    where: {
      id : { [Op.in]: speakerIds}
    }
  });

  const speakerObj  = keyBy(speakers,v=>v.get('id'));

  const teamTime = transcript.reduce((cur,v)=>{
    const speakerId = v.get('speaker_id');
    if(get(speakerObj,[speakerId,'team_member']) == 1){
      cur += v.start_time;
    }

    return cur;
  },0);

  const totalTime = maxBy(transcript,v=>v.get('end_time'));

  return Math.round(teamTime/totalTime);
};