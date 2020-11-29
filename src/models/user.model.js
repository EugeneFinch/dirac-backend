
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

  }, {
    timestamps: true
  });

  // eslint-disable-next-line no-unused-vars
  user.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return user;
};
