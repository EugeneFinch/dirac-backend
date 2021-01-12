const get = require('lodash/get');
const Sequelize = require('sequelize');

const Op = Sequelize.Op;
/* eslint-disable no-unused-vars */
class Service {
  constructor (options) {
    this.options = options || {};
  }

  async find (params) {
    const recordingId = get(params,'query.recording_id');
    const sequelize = this.options.app.get('sequelizeClient');
    const { transcript,transcript_keyword_recap_config } = sequelize.models;
    const keywords = await transcript_keyword_recap_config.findAll();
    const queries =  keywords.map(v=>v.get('criteria').map(c=> ({ search_content: {[Op.like]: `%${c}%`}})));

    const totals = await Promise.all(
      queries.map(q=>transcript.count({
        where: {
          recording_id: recordingId,
          [Op.or]: q
        }
      }))
    );


    return keywords.map((v,idx)=>({
      name:v.name,
      code:v.code,
      total:get(totals,idx),
    }));
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
