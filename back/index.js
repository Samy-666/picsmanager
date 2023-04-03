const express = require('express');
const app = express();
const port = 3000;
const pool = require('./db');
const bodyParser = require('body-parser');
var fileupload = require("express-fileupload");
const auth = require("./middleware/index.js");
const cors = require('cors');
const fs = require('fs');
const https = require('https');

app.use(cors());
app.use(fileupload());
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json());



const options = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.cert')
};

const server = https.createServer(options, app);

server.listen(3000, () => {
  console.log('Server listening on port 443');
});

app.get('/', (req, res) => res.send('Hello World!'));

pool.connect((err, client, done) => {
  if (err) throw err;
  console.log('Bien connecté à la bdd !');
});


require("./routes/user.route")(app);
require("./routes/pictures.route")(app);
require("./routes/album.route")(app);



