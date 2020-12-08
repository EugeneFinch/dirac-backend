const { get } = require('lodash');
const { disallow } = require('feathers-hooks-common');
const { authenticate } = require('@feathersjs/authentication').hooks;
const { protect } = require('@feathersjs/authentication-local').hooks;

module.exports = {
  before: {
    all: [],
    find: [authenticate('jwt')],
    get: [],
    create: [
      // disallow('external')
    ],
    update: [
      disallow('external')
    ],
    patch: [
      disallow('external')
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
          await ctx.app.service('company-user').create({
            user_id:userId,
            company_id : get(company,'0.id'),
            is_admin:0
          });
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
