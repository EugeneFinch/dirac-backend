// eslint-disable-next-line no-unused-vars
var cors = require('cors');
const dev = process.env.NODE_ENV !== 'production';
const whitelist = [  
];

if(dev){
  whitelist.push(
    [
      'http://localhost:3000',
      'http://localhost:8000',
    ]
  );
}

module.exports = function(app) {
  // Add your custom middleware here. Remember that
  // in Express, the order matters.
  app.use(
    cors({
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      origin: whitelist
    })
  );
};
