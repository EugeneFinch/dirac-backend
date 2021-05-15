// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const answer = sequelizeClient.define('answer', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    question_id:  { type: DataTypes.INTEGER },
    recording_id: { type: DataTypes.INTEGER },
    speaker_id: { type: DataTypes.INTEGER },
    answer: { type: DataTypes.STRING },
    intent: { type: DataTypes.STRING },
    intent_info: { type: DataTypes.JSON },
    start_time: { type: DataTypes.STRING },
    end_time: { type: DataTypes.STRING },
  }, {
    timestamps: false
  });

  // eslint-disable-next-line no-unused-vars
  answer.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return answer;
};
