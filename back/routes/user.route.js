module.exports = app => {
    const user = require("../controllers/user.controller.js");
    const router = require("express").Router();
    app.post("/user/register", user.register);
    app.get("/user", user.findAll);
    app.get("/user/:userId", user.findOne);
    app.post("/user/verify", user.verifyUser);
    app.post("/user/authenticate", user.authenticate);
    app.use('/user', router);

}