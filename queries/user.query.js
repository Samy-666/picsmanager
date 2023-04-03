const pool = require('../db.js')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = function (user) {
    this.username = user.username;
    this.email = user.email;
    this.password = user.password;
    this.token = user.token;
}

User.create = (newUser, result) => {
    pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [newUser.username, newUser.email, newUser.password], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        const token = jwt.sign({ id: res.insertId }, 'yHCBW76lh9B/kvPioDcRNhaAnflxIBwncYw6YvzzHZ7mIIF8U8R1O9rXmahVEJ3r', {
            expiresIn: 172800 // 48 hours
        });
        this.token = token;
        console.log("created user: ", { id: res.insertId, ...newUser });
        result(null, { id: res.insertId, ...newUser, token: token });
    });
};

User.findById = (userId, result) => {
    pool.query(`SELECT * FROM users WHERE user_id = ${userId}`, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        if (res.rows.length) {
            console.log("found user: ", res.rows[0]);
            result(null, res.rows[0]);
            return;
        }
        // not found User with the id
        result({ kind: "not_found" }, null);
    });
}

User.getAll = result => {
    pool.query("SELECT * FROM users", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        console.log("users: ", res.rows);
        result(null, res.rows);
    });
}

User.updateById = (id, user, result) => {
    pool.query(
        "UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4",
        [user.username, user.email, user.password, id],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(null, err);
                return;
            }
            if (res.rowCount == 0) {
                // not found User with the id
                result({ kind: "not_found" }, null);
                return;
            }
            console.log("updated user: ", { id: id, ...user });
            result(null, { id: id, ...user });
        }
    );
};

User.remove = (id, result) => {
    pool.query("DELETE FROM users WHERE id = $1", [id], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        if (res.rowCount == 0) {
            // not found User with the id
            result({ kind: "not_found" }, null);
            return;
        }
        console.log("deleted user with id: ", id);
        result(null, res);
    });
};

User.removeAll = result => {
    pool.query("DELETE FROM users", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        console.log(`deleted ${res.rowCount} users`);
        result(null, res);
    });
}


User.authenticate = (username, password, result) => {
    pool.query(`SELECT * FROM users WHERE users.username = '${username}'`, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        if (res.rows.length) {
            bcrypt.compare(password, res.rows[0].password, function (err, resultat) {
                if (resultat) {
                    console.log("password correct");
                    const token = jwt.sign({ id: res.rows[0].user_id }, 'yHCBW76lh9B/kvPioDcRNhaAnflxIBwncYw6YvzzHZ7mIIF8U8R1O9rXmahVEJ3r', {
                        expiresIn: 172800 // 48 hours
                    });
                    this.token = token;
                    console.log("Login successfull: ", { id: res.rows[0].user_id, token: token });
                    result(null, { id: res.rows[0].user_id, token: token });
                } else {
                    console.log("password incorrect");
                    result({ kind: "not_found" }, null);
                }
            });
        }
    });
}


module.exports = User;