// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const transcriptKeywordRecapConfig = sequelizeClient.define('transcript_keyword_recap_config',{
    id: { type: DataTypes.INTEGER,autoIncrement: true,primaryKey:true },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    criteria: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('criteria');
        return rawValue ? rawValue.split(',') : null;
      }
    },
  },{
    timestamps: false,
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  transcriptKeywordRecapConfig.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return transcriptKeywordRecapConfig;
};


