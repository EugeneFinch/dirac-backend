// eslint-disable-next-line no-unused-vars
var cors = require('cors');

module.exports = function(app) {
  app.use(
    cors({
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      origin:['http://localhost:3000','http://localhost:8000','https://app.diracnlp.com','https://app-dev.diracnlp.com'],
    })
  );
};
