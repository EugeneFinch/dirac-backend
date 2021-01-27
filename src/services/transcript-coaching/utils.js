const get = require('lodash/get');
const maxBy = require('lodash/maxBy');
const minBy = require('lodash/minBy');
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

  const endTime = maxBy(transcripts,v=>v.get('end_time')).get('end_time');
  const startTime = minBy(transcripts,v=>v.get('start_time')).get('start_time');
  const totalTime = endTime - startTime;
  const res  = Math.round(teamTime/totalTime*100);
  ctx.data={
    ...ctx.data,
    team_talk_time:res
  };

};

const getFillerWordPerMin = async (ctx)=> {
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
  const fillerReg = new RegExp('\\b(ah|uh|erm|like|you know|I mean|okay|so|actually|basically|right)\\b','gi');

  const agg = transcripts.reduce((cur,v)=>{
    const speakerId = v.get('speaker_id');
    if(get(speakerObj,[speakerId,'team_member']) == 1){
      const isFiller = fillerReg.test(v.content);
      if (isFiller){
        cur.no_filer += 1;
      }
      cur.talk_time += (v.end_time - v.start_time);
    }

    return cur;
  },{talk_time:0,no_filer:0});

  const res  = agg.talk_time == 0 ? 0 : Math.round(agg.no_filer/ (agg.talk_time/60));
  ctx.data={
    ...ctx.data,
    filler_word_per_min:res
  };

};

const getNextStep = async (ctx)=> {
  const recordingId = get(ctx,'data.transcripts.0.recording_id');
  if(!recordingId){
    return null;
  }

  const nextStep = await ctx.app.service('transcript').find({
    query:{
      $skip: 0,
      $limit: 1,
      recording_id: recordingId,
      predefined_keyword: 'next_step'
    }
  });
  

  ctx.data={
    ...ctx.data,
    next_steps:(nextStep.total > 0)
  };

};


module.exports = {
  fetchTranScript,
  getFillerWordPerMin,
  getTeamTalkTime,
  getNextStep,
};