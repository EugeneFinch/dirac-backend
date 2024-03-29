// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const calendarEvent = sequelizeClient.define('calendar_event', {
    id: { type: DataTypes.STRING, primaryKey: true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    kind: {
      type: DataTypes.STRING,
    },
    etag: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
    },
    htmlLink: {
      type: DataTypes.STRING,
    },
    created: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW
    },
    updated: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW
    },
    summary: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    attendees: {
      type: DataTypes.TEXT,
    },
    creator: {
      type: DataTypes.STRING,
    },
    start: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW
    },
    time_zone: {
      type: DataTypes.STRING,
    },
    end: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW
    },
    description: {
      type: DataTypes.STRING,
    },
    hangoutLink: {
      type: DataTypes.STRING,
    },
    joined: {
      type: DataTypes.TINYINT,
      defaultValue: 0
    }
  }, {
    timestamps: false,
    tableName: 'calendar_event',
    freezeTableName: true
  });

  // eslint-disable-next-line no-unused-vars
  calendarEvent.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return calendarEvent;
};
