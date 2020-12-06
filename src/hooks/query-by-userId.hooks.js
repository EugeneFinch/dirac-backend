const get = require('lodash/get');
const set = require('lodash/set');

module.exports = function (ctx) {
  const userId = get(ctx,'params.user.id',0);
  set(ctx,'params.query.user_id',userId);
};