const get = require('lodash/get');
const set = require('lodash/set');

module.exports = async function (ctx) {
  const sequelize = ctx.app.get('sequelizeClient');
  const { user } = sequelize.models;
  ctx.params.sequelize = {
    include: [ {
      model: user,
      attributes: ['email'],
    } ]
  };
};