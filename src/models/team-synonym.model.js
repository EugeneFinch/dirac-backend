// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const teamSynonym = sequelizeClient.define('team_synonym', {
    id: { type: DataTypes.INTEGER, autoIncrement: true,primaryKey:true },
    team_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    synonym: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
    timestamps: false,
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  teamSynonym.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return teamSynonym;
};
