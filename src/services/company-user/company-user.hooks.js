const { disallow,required,preventChanges } = require('feathers-hooks-common');
const get = require('lodash/get');
const { NotFound, BadRequest, Forbidden } = require('@feathersjs/errors');
const { authenticate } = require('@feathersjs/authentication').hooks;

const isAdmin = async (ctx) => {
  const requestedUser = ctx.params.user;
  const sequelize = ctx.app.get('sequelizeClient');
  const { company_user } = sequelize.models;

  const isAdmin = await company_user.count({
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
        const { user,company_user } = sequelize.models;
        const companyUser = await company_user.findOne({where :{user_id:userId}});
        if(!companyUser){
          throw new NotFound ('Company not found');
        }
        
        const companyId = companyUser.get('company_id');
        context.params.query = {
          ...context.params.query,
          company_id : companyId,
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
        const { company_user:cUserModel } = sequelize.models;
        const companyUser = await cUserModel.findOne({where :{user_id:userId}});
        if(!companyUser){
          throw new NotFound ('Company not found');
        }

        const email = ctx.data.email;
        const companyId = companyUser.get('company_id');
        // const domain = email.split('@')[1];
        // const company = await ctx.app.service('company').get(companyId);
        // if(company.email_domain != domain){
        //   throw new BadRequest('Email is not same domain with company');
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

        if(addUser && addUser.get('company_id') == companyId){
          throw new BadRequest('User is existed');
        }

        if(addUser && addUser.get('company_id') != companyId){
          throw new BadRequest('User is in another company');
        }
       

        ctx.data = {
          user_id : user.id,
          company_id: companyId,
          is_admin:ctx.data.is_admin || 0
        };
      }
    ],
    update: [
      disallow('external')

    ],
    patch: [
      preventChanges('id','user_id','company_id'),
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
