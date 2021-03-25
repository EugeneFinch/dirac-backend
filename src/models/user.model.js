
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const user = sequelizeClient.define('user', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },

    type: {
      type: DataTypes.STRING,
    },

    auth0Id: { type: DataTypes.STRING, },

    googleId: { type: DataTypes.STRING, },
    nextSyncToken: { type: DataTypes.STRING, },
    resourceId: { type: DataTypes.STRING, },
    gRefreshToken: { type: DataTypes.STRING, },
    lastCheck: { type: DataTypes.DATE }

  }, {
    timestamps: true
  });

  // eslint-disable-next-line no-unused-vars
  user.associate = function (models) {
    user.hasOne(models.team_user, {
      foreignKey: {
        name: 'user_id'
      }
    });
  };

  return user;
};
