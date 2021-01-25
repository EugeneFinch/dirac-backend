// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const recording = sequelizeClient.define('recording', {
    id: { type: DataTypes.INTEGER, autoIncrement: true,primaryKey:true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('RECORDING','QUEUED','IN_PROGRESS','FAILED','COMPLETED'),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW
    }
  },{
    timestamps: false
  });

  recording.associate = function (models) {
    recording.belongsTo(models.user,{
      foreignKey: {
        name: 'user_id'
      }});
  };

  return recording;
};
