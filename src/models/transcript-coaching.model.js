// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const transcriptCoaching = sequelizeClient.define('transcript_coaching', {
    id: { type: DataTypes.INTEGER, autoIncrement: true,primaryKey:true },
    recording_id : {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    team_talk_time : {
      type: DataTypes.INTEGER,
    },
    longest_monologue : {
      type: DataTypes.INTEGER,
    },
    filler_word_per_min : {
      type: DataTypes.INTEGER,
    },
    resp_time : {
      type: DataTypes.INTEGER,
    },
    no_engage_question : {
      type: DataTypes.INTEGER,
    },
    no_customer_objection : {
      type: DataTypes.INTEGER,
    },
    next_steps : {
      type: DataTypes.INTEGER,
    },
    no_competitor_mention: {
      type: DataTypes.INTEGER,
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
  transcriptCoaching.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return transcriptCoaching;
};
