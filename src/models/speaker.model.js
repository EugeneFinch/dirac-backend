// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const speaker = sequelizeClient.define('speaker', {
    id: { type: DataTypes.INTEGER, autoIncrement: true,primaryKey:true },
    name: { type: DataTypes.STRING },
  },{
    timestamps: false
  });

  // eslint-disable-next-line no-unused-vars
  speaker.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return speaker;
};
