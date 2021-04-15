const mysql = require('mysql');
let connection;

const connect = async (app) => {
  connection = mysql.createConnection(app.get('mysql'));
  connection.connect(async function (err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected as id ' + connection.threadId);
  });
}
const client = {
  query: async (query, values) => {
    try {
      const data = await new Promise((res, rej) => {
        connection.query(query, values, function (error, data) {
          if (error) rej(error);
          res(data)
        });
      });
      return data;
    } catch (err) {

      if ((!values || !values.length) && query.values && query.values.length) values = query.values;
      // eslint-disable-next-line max-len
      err.message = `Error in query:\n ${query.text ? query.text : query} ${values && values.length ? `, values: ${values.join()}` : ''}\nerror message: ${err.message}`;
      throw err;
    }
  },
  on: async () => {
    const client = await connect();
    return client;
  },
};
module.exports = { connect, client }