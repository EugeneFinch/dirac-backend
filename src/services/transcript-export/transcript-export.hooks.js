
const get = require('lodash/get');
const {BadRequest} = require('@feathersjs/errors');
const uniq = require('lodash/uniq');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const keyBy = require('lodash/keyBy');

const fetchTranScript = async (ctx) => {
  const recordingId = get(ctx,'id');
  if(!recordingId){
    throw new BadRequest('Missing recording id');
  }
  const sequelize = ctx.app.get('sequelizeClient');
  const { transcript } = sequelize.models;
  let transcripts = await transcript.findAll({
    where: {
      recording_id : recordingId
    }
  });

  const {speaker } = sequelize.models;
  const speakerIds = uniq(transcripts.map(v=>v.speaker_id));

  const speakers = await speaker.findAll({
    where: {
      id : { [Op.in]: speakerIds}
    }
  });
  const speakerObj  = keyBy(speakers,v=>v.get('id'));

  transcripts = transcripts.map((v)=>{
    const speakerId = v.get('speaker_id');
    const name = get(speakerObj,[speakerId,'name']);
    v.speaker_name = name;
    return v;
  });

  ctx.result = transcripts;
  
};


module.exports = {
  before: {
    all: [],
    find: [],
    get: [fetchTranScript],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
