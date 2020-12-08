const { disallow,required,preventChanges } = require('feathers-hooks-common');
const get = require('lodash/get');
const { NotFound, BadRequest, Forbidden } = require('@feathersjs/errors');
const { authenticate } = require('@feathersjs/authentication').hooks;

const isAdmin = async (ctx) => {
  const requestedUser = ctx.params.user;
  const isAdmin = await ctx.app.service('company-user').find({
    query:{
      user_id : requestedUser.id,
      is_admin: 1,
    }
  }).then(((data)=> get(data,'data.0',false)));
  if(!isAdmin){
    throw new Forbidden('Access Denied');
  }
};

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [
      required('email','company_id','is_admin'),
      isAdmin,
      async ctx=>{
        const email = ctx.data.email;
        const companyId = ctx.data.company_id;
        const domain = email.split('@')[1];
        const company = await ctx.app.service('company').get(companyId);
        if(company.email_domain != domain){
          throw new BadRequest('Email is not same domain with company');
        }

        const user = await ctx.app.service('users').find({
          query:{
            email
          }
        }).then(((data)=> get(data,'data.0',null)));
        if(!user){
          throw new NotFound('Email not found');
        }

        const companyUser = await ctx.app.service('company-user').find({
          query:{
            user_id : user.id,
            company_id: companyId,
          }
        }).then(((data)=> get(data,'data.0',null)));
        if(companyUser){
          throw new BadRequest('Email is existed in company');
        }

       

        ctx.data = {
          user_id : user.id,
          company_id: companyId,
          is_admin:ctx.data.is_admin
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
      disallow('external')
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
