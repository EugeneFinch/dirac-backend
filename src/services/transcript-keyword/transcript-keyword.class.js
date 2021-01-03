const get = require('lodash/get');
const Sequelize = require('sequelize');
const {PREDEFINED_KEYWORD}  = require('./constants');

const Op = Sequelize.Op;
/* eslint-disable no-unused-vars */
class Service {
  constructor (options) {
    this.options = options || {};
  }

  async find (params) {
    const recordingId = get(params,'query.recording_id');
    const sequelize = this.options.app.get('sequelizeClient');
    const { transcript } = sequelize.models;

    const queries =  PREDEFINED_KEYWORD.map(v=>v.criteria.map(c=> ({ search_content: {[Op.like]: `%${c}%`}})));

    const totals = await Promise.all(
      queries.map(q=>transcript.count({
        where: {
          recording_id: recordingId,
          [Op.or]: q
        }
      }))
    );


    return PREDEFINED_KEYWORD.map((v,idx)=>({
      name:v.name,
      code:v.code,
      color:v.color,
      total:get(totals,idx),
    }));
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
