const { Pool } = require('pg');
//create connection postgresql
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'picsmanager',
    password: 'root',
    port: 5432,
});

//export pool
module.exports = pool;