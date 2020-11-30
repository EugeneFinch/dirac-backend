// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const mailHistory = sequelizeClient.define('mail_history', {
    id: { type: DataTypes.INTEGER, autoIncrement: true,primaryKey:true },
    history_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  },{
    timestamps: false
  });

  return mailHistory;
};
