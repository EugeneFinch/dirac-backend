const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication');
const { LocalStrategy } = require('@feathersjs/authentication-local');
const { expressOauth, OAuthStrategy } = require('@feathersjs/authentication-oauth');
const { get } = require('lodash');
const calendar = require('./calendar');
const env = process.env.NODE_ENV || 'dev';

class GoogleStrategy extends OAuthStrategy {
  async getProfile(authResult) {
    const profile = await super.getProfile(authResult);
    const email = authResult.id_token.payload.email;
    const key = this.app.get('GOOGLE_API_KEY');

    const { data: user } = await this.app.service('users').find({
      query: {
        email,
        $limit: 1,
      }
    });

    if (user.length > 0) {
      console.log("user", user);
      console.log("id", `${env}-${get(user, "0.id")}`);
      const response = await calendar.watchCalendar({
        token: authResult.access_token,
        email,
        id: `${env}-${get(user, '0.id')}`,
        resourceId: `${env}-${get(user, '0.resourceId')}`
      });

      const resourceId = get(response, 'data.resourceId');

      if (resourceId) {
        await this.app.service('users').patch(get(user, '0.id'), { resourceId });
      }
      
      await this.app.service('users').patch(get(user, '0.id'), { gDisplayName: profile.name ? profile.name : profile.email });
      if (authResult.refresh_token) await this.app.service('users').patch(get(user, '0.id'), { gRefreshToken: authResult.refresh_token });
      calendar.handleUpdateCalendarEvent({ app: this.app, token: authResult.access_token, email, key, user_id: get(user, '0.id'), });
    }

    return profile;
  }
  async getEntityData(profile) {
    // this will set 'googleId'
    const baseData = await super.getEntityData(profile);
    // this will grab the picture and email address of the Google profile
    return {
      ...baseData,
      profilePicture: profile.picture,
      email: profile.email,
      type: 'google'
    };
  }
}

module.exports = app => {
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());
  authentication.register('google', new GoogleStrategy());

  app.use('/authentication', authentication);

  app.get('/oauth/cookie', (req, res) => {
    const { access_token } = req.query;

    if (access_token) {
      res.cookie('access_token', access_token, {
        httpOnly: false
        // other cookie options here
      });
    }

    res.redirect(`${app.get('front-end')}/user/login/success?access_token=${access_token}`);
  });

  app.use('*', (req, res, next) => {
    if (req.headers.authorization) {
      req.feathers.authentication = {
        strategy: 'jwt',
        accessToken: req.headers.authorization
      };
    }
    next();
  });

  app.configure(expressOauth());
};