const get = require('lodash/get');
const maxBy = require('lodash/maxBy');
const keyBy = require('lodash/keyBy');
const uniq = require('lodash/uniq');
const Sequelize = require('sequelize');

const Op = Sequelize.Op;

const fetchTranScript = async (ctx) => {
  const coaching = await ctx.service._get(ctx.id);
  const recordingId = get(coaching,'recording_id');
  if(!recordingId){
    return;
  }
  
  const sequelize = ctx.app.get('sequelizeClient');
  const { transcript } = sequelize.models;
  const transcripts = await transcript.findAll({
    where: {
      recording_id : recordingId
    }
  });

  ctx.data = {
    ...ctx.data,
    transcripts
  };
  
};

const getTeamTalkTime = async (ctx)=> {
  const transcripts = get(ctx,'data.transcripts');
  if(!transcripts){
    return null;
  }

  const sequelize = ctx.app.get('sequelizeClient');
  const {speaker } = sequelize.models;
  const speakerIds = uniq(transcripts.map(v=>v.speaker_id));

  const speakers = await speaker.findAll({
    where: {
      id : { [Op.in]: speakerIds}
    }
  });

  const speakerObj  = keyBy(speakers,v=>v.get('id'));

  const teamTime = transcripts.reduce((cur,v)=>{
    const speakerId = v.get('speaker_id');
    if(get(speakerObj,[speakerId,'team_member']) == 1){
      cur += (v.end_time - v.start_time);
    }

    return cur;
  },0);

  const totalTime = maxBy(transcripts,v=>v.get('end_time')).get('end_time');
  const res  = Math.round(teamTime/totalTime*100);
  ctx.data={
    ...ctx.data,
    team_talk_time:res
  };

};


module.exports = {
  fetchTranScript,
  getTeamTalkTime
};