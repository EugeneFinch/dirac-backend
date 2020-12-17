const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication');
const { LocalStrategy } = require('@feathersjs/authentication-local');
const { expressOauth, OAuthStrategy } = require('@feathersjs/authentication-oauth');
const { get, map } = require('lodash');
const calendar = require('./calendar');

class GoogleStrategy extends OAuthStrategy {
  async getProfile(authResult) {
    const profile = await super.getProfile(authResult);
    const email = authResult.id_token.payload.email;
    const sub = authResult.id_token.payload.sub;
    const key = this.app.get('GOOGLE_API_KEY');

    calendar.watchCalendar({
      token: authResult.access_token,
      email,
      id: sub
    })

    const response = await calendar.getEventList({ token: authResult.access_token, email, key });
    const items = get(response, 'data.items');
    const db = this.app.get('sequelizeClient')
    const { data: user } = await this.app.service('users').find({
      query: {
        email,
        $limit: 1,
      }
    });

    if (user.length > 0) {
      map(items, item => {
        const params = {
          id: item.id,
          kind: item.kind,
          etag: item.etag,
          status: item.status,
          htmlLink: item.htmlLink,
          created: item.created,
          creator: get(item, 'creator.email', ''),
          updated: item.updated,
          summary: item.summary,
          location: item.location,
          time_zone: item.start.timeZone,
          user_id: get(user, '0.id'),
          attendees: item.attendees,
          start: item.start.dateTime,
          end: item.end.dateTime,
          description: item.description,
          hangoutLink: item.hangoutLink,
        }
        db.models.calendar_event.upsert(params)
          .then(o => console.log('upsert success'))
          .catch(e => console.log('upsert error', e));
      })
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