/* eslint-disable no-unused-vars */
const _ = require('lodash');
const { NotFound } = require('@feathersjs/errors');

function calculateTalkToListenPercentage(data) {
  return _.map(data, ({ speakerName, talkingTime, conversationTime }) => {
    const talk_ratio = (talkingTime/conversationTime * 100).toFixed(2) * 1;
    const listen_ratio = (100 - talk_ratio).toFixed(2) * 1;

    return {
      name: speakerName,
      talk_ratio,
      listen_ratio
    };
  });
}

class Service {
  constructor (options, app) {
    this.options = options || {};
    this.app = app;
    this.sequelize = this.app.get('sequelizeClient');
  }

  async find (ctx) {
    const { userId } = ctx.query;
    const { team_user: teamUserModel, team: teamModel } = this.sequelize.models;

    const teamUser = await teamUserModel.findOne({
      where: {
        user_id: userId
      },
      include: [{
        model: teamModel
      }]
    });

    if(!teamUser) {
      throw new NotFound('User not found');
    }

    const userIds = await this.getUserInTeam(userId);
    const recordingIds = await this.getRecordingByUserIds(userIds);
    const data = await this.getTalkToListenByRecordingIds(recordingIds);

    const recommendedRatioObj = {
      name: 'Recommended Ratio',
      talk_ratio: 45,
      listen_ratio: 55
    };

    const parseRatioFromDB = calculateTalkToListenPercentage(data);
    parseRatioFromDB.push(recommendedRatioObj);

    return {
      result: parseRatioFromDB,
      team: teamUser.team && teamUser.team.name || 'default'
    };
  }

  async get (id, params) {
    return id;
  }

  async create (data, params) {
    return data;
  }


  async update (id, data, params) {
    return {message:'done'};
  }

  async patch (id, data, params) {
    return data;
  }

  async remove (id, params) {
    return { id };
  }

  fetch(query) {
    return this.sequelize.query(query, { type: this.sequelize.QueryTypes.SELECT});
  }

  async getUserInTeam(userId) {
    if(!userId) {
      return null;
    }

    const query = 'SELECT tu2.user_id FROM team_user AS tu1, team_user AS tu2 WHERE tu1.user_id = ' + userId + ' AND tu1.team_id = tu2.team_id';
    const result = await this.fetch(query);
    return _.map(result, v => v.user_id);
  }

  async getRecordingByUserIds(userIds) {
    if(!userIds || userIds.length == 0) {
      return null;
    }

    const query =
      'SELECT id FROM recording WHERE recording.user_id IN (' + userIds +') AND status="COMPLETED"';
    const result = await this.fetch(query);
    return _.map(result, v => v.id);
  }

  async getTalkToListenByRecordingIds(recordingIds) {
    if(!recordingIds || recordingIds.length == 0) {
      return null;
    }

    // eslint-disable-next-line max-len
    const query = 'SELECT s.name AS speakerName, SUM(ts.end_time - ts.start_time) AS talkingTime, max_recording.max_time AS conversationTime ' +
      'FROM transcript AS ts, speaker AS s,' +
      // eslint-disable-next-line max-len
      '(SELECT ts.recording_id, max(ts.end_time) AS max_time FROM transcript AS ts GROUP BY ts.recording_id) AS max_recording ' +
      // eslint-disable-next-line max-len
      'WHERE ts.speaker_id = s.id AND ts.recording_id IN (' + recordingIds +')  AND ts.recording_id = max_recording.recording_id AND s.team_member = TRUE ' +
      'GROUP BY s.name';

    return this.fetch(query);
  }

}

module.exports = function (options, app) {
  return new Service(options, app);
};

module.exports.Service = Service;
