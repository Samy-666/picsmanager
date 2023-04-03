const ftp = require('ftp');

const client = new ftp();
const config = {
  host: '127.0.0.1',
  port: 21,
  user: 'sam',
  password: 'root'
};
client.connect(config);

module.exports = client;