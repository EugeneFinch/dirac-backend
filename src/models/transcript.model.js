// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const transcribe = sequelizeClient.define('transcript', {
    id: { type: DataTypes.INTEGER, autoIncrement: true,primaryKey:true },
    speaker_id: { type: DataTypes.INTEGER },
    recording_id: { type: DataTypes.INTEGER },
    content: { type: DataTypes.STRING },
    search_content: { type: DataTypes.STRING },
    start_time: { type: DataTypes.STRING },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW
    }
  },{
    timestamps: false
  });

  // eslint-disable-next-line no-unused-vars
  transcribe.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return transcribe;
};
