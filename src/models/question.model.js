// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const question = sequelizeClient.define('question', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    recording_id: { type: DataTypes.INTEGER },
    speaker_id: { type: DataTypes.INTEGER },
    question: { type: DataTypes.STRING },
    intent: { type: DataTypes.STRING },
    start_time: { type: DataTypes.STRING },
    end_time: { type: DataTypes.STRING },
  }, {
    timestamps: false
  });

  // eslint-disable-next-line no-unused-vars
  question.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return question;
};
