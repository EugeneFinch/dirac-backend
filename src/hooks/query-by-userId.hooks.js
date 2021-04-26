const get = require('lodash/get');
const set = require('lodash/set');

module.exports = async function (ctx) {
  const userId = get(ctx, 'params.user.id', 0);
  const team = await ctx.app.service('team-user')._find({
    query: {
      user_id: userId,
    },
  });

  const teamUser = get(team, 'data.0');
  if (!teamUser || teamUser.is_admin != 1 || ctx.params.query.filter === 'my') {
    delete ctx.params.query.filter;
    set(ctx, 'params.query.user_id', userId);
    return;
  }

  if (teamUser) {
    if(ctx.params.query.filter === 'all') {
      delete ctx.params.query.filter;
    }

    const allTeamUser = await ctx.app.service('team-user')._find({
      query: { team_id: teamUser.team_id },
      paginate: false
    });
    const userIds = allTeamUser.map(v => v.user_id);
    userIds.splice(userIds.indexOf(userId), 1);
    set(ctx, 'params.query.user_id', userIds);

    return;
  }
};
