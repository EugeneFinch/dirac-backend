// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const teamUser = sequelizeClient.define('team_user', {
    id: { type: DataTypes.INTEGER, autoIncrement: true,primaryKey:true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    team_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_admin: {
      type: DataTypes.INTEGER,
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
  teamUser.associate = function (models) {
    teamUser.belongsTo(models.user,{
      foreignKey: {
        name: 'user_id'
      }});

    teamUser.belongsTo(models.team,{
      foreignKey: {
        name: 'team_id'
      }});
  };
  return teamUser;
};
