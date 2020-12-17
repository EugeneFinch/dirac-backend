const axios = require('axios');
const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication');
const { LocalStrategy } = require('@feathersjs/authentication-local');
const { expressOauth, OAuthStrategy } = require('@feathersjs/authentication-oauth');

class GoogleStrategy extends OAuthStrategy {
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
    // res.redirect('http://localhost:8000');
  });

  app.use('*',(req,res,next)=>{
    if(req.headers.authorization){
      req.feathers.authentication = {
        strategy: 'jwt',
        accessToken:req.headers.authorization
      };
    }
    next();
  });

  app.configure(expressOauth());
};