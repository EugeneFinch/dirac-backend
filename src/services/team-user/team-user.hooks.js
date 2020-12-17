const { disallow,required,preventChanges } = require('feathers-hooks-common');
const get = require('lodash/get');
const { NotFound, BadRequest, Forbidden } = require('@feathersjs/errors');
const { authenticate } = require('@feathersjs/authentication').hooks;

const isAdmin = async (ctx) => {
  const requestedUser = ctx.params.user;
  const sequelize = ctx.app.get('sequelizeClient');
  const { team_user } = sequelize.models;

  const isAdmin = await team_user.count({
    where:{
      user_id : requestedUser.id,
      is_admin: 1,
    }
  }).then(c => c >0);
  if(!isAdmin){
    throw new Forbidden('Access Denied');
  }
};

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [
      async context => {
        const userId = context.params.user.id;
        const sequelize = context.app.get('sequelizeClient');
        const { user,team_user } = sequelize.models;
        const teamUser = await team_user.findOne({where :{user_id:userId}});
        if(!teamUser){
          context.result = {data:[]} ;
          return;
        }
        
        const teamId = teamUser.get('team_id');
        context.params.query = {
          ...context.params.query,
          team_id : teamId,
          user_id : {$ne: userId}
        };

        context.params.sequelize = {
          include: [ {
            model: user,
            attributes: ['email'],
          } ]
        };
      }

    ],
    get: [],
    create: [
      required('email'),
      isAdmin,
      async ctx=>{
        const userId = ctx.params.user.id;
        const sequelize = ctx.app.get('sequelizeClient');
        const { team_user:cUserModel } = sequelize.models;
        const teamUser = await cUserModel.findOne({where :{user_id:userId}});
        if(!teamUser){
          throw new NotFound ('Company not found');
        }

        const email = ctx.data.email;
        const teamId = teamUser.get('team_id');
        // const domain = email.split('@')[1];
        // const team = await ctx.app.service('team').get(teamId);
        // if(team.email_domain != domain){
        //   throw new BadRequest('Email is not same domain with team');
        // }

        let user = await ctx.app.service('users').find({
          query:{
            email
          }
        }).then(((data)=> get(data,'data.0',null)));
        if(!user){
          user = await ctx.app.service('users').create({
            email,
            password: Math.random().toString()
          });
        }

        const addUser = await cUserModel.findOne({
          where:{
            user_id : user.id,
          }
        });

        if(addUser && addUser.get('team_id') == teamId){
          throw new BadRequest('User is existed');
        }

        if(addUser && addUser.get('team_id') != teamId){
          throw new BadRequest('User is in another team');
        }
       

        ctx.data = {
          user_id : user.id,
          team_id: teamId,
          is_admin:ctx.data.is_admin || 0
        };
      }
    ],
    update: [
      disallow('external')

    ],
    patch: [
      preventChanges('id','user_id','team_id'),
      required('is_admin'),
      isAdmin
    ],
    remove: [
      isAdmin
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
