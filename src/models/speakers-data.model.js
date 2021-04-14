// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const speakersData = sequelizeClient.define('speakers_data', {
    id: { type: DataTypes.INTEGER, autoIncrement: true,primaryKey:true },
    recordingId: { type: DataTypes.STRING },
    user_name: { type: DataTypes.STRING },
    start: { type: DataTypes.STRING },
    end: { type: DataTypes.STRING },
  },{
    timestamps: false
  });

  // eslint-disable-next-line no-unused-vars
  speakersData.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return speakersData;
};
