// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const companyUser = sequelizeClient.define('company_user', {
    id: { type: DataTypes.INTEGER, autoIncrement: true,primaryKey:true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    company_id: {
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
  return companyUser;
};
