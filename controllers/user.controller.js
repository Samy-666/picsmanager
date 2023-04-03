const User = require('../queries/user.query.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.authenticate = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    User.authenticate(username, password, (err, data) => {

        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found User with username ${username}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving User with username " + username
                });
            }
        } else {
            res.status(200).send(data);
        }
    });
}


exports.register = (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }
    console.log(req.body);
    const encryptedPassword = bcrypt.hash(req.body.password, saltRounds).then(function (hash) {
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hash
        });

        User.create(user, (err, data) => {
            if (err)
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while creating the User."
                });
            else res.send(data);
        });
    });
}

exports.findAll = (req, res) => {
    User.getAll((err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving users."
            });
        else res.send(data);
    });
}

exports.findOne = (req, res) => {
    User.findById(req.params.userId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found User with id ${req.params.userId}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving User with id " + req.params.userId
                });
            }
        } else res.send(data);
    });
}

exports.verifyUser = (req, res) => {
    const token = req.body.token || req.query.token || req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const decoded = jwt.verify(token, "yHCBW76lh9B/kvPioDcRNhaAnflxIBwncYw6YvzzHZ7mIIF8U8R1O9rXmahVEJ3r");
        req.user = decoded;
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    res.status(200).send(req.user);
}
