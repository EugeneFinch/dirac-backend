const { get } = require('lodash');
const { disallow,iff,isProvider ,required} = require('feathers-hooks-common');
const { authenticate } = require('@feathersjs/authentication').hooks;
const { protect,hashPassword } = require('@feathersjs/authentication-local').hooks;

module.exports = {
  before: {
    all: [],
    find: [authenticate('jwt')],
    get: [
      context=>{
        const sequelize = context.app.get('sequelizeClient');
        const { company_user } = sequelize.models;
        context.params.sequelize = {
          include: [ {
            model: company_user,
            attributes: ['is_admin'],
          } ]
        };
      }
    ],
    create: [
      disallow('external'),
      iff(ctx=>ctx.data.password, hashPassword('password')),
      async context=>{
        const sequelize = context.app.get('sequelizeClient');
        const { user } = sequelize.models;
        const u = await user.findOne({where:{email:context.data.email}});
        if(u){
          const data = await context.service.patch(u.get('id'),context.data);
          context.result = data;
        }

      }
    ],   
    update: [
      disallow('external'),
    ],
    patch: [
      disallow('external'),
      hashPassword('password')
    ],
    remove: []
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password')
    ],
    find: [],
    get: [],
    create: [
      async ctx=> {
        const email = ctx.result.email;
        const userId = ctx.result.id;
        const domain = email.split('@')[1];
        if(domain==='gmail.com'){
          return;
        }

        const {data:company} = await ctx.app.service('company').find({
          query: {
            email_domain:domain
          }
        });

        const isExistCompany = company.length > 0 ;
        if(isExistCompany){
          return;
        }

        const res = await ctx.app.service('company').create({
          name:domain.toUpperCase(),
          email_domain:domain
        });

        await ctx.app.service('company-user').create({
          user_id:userId,
          company_id : get(res,'id'),
          is_admin:1
        });
      }
    ],
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
