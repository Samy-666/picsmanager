module.exports = app => {
    const album = require("../controllers/album.controller.js");
    const router = require("express").Router();
    const auth = require("../middleware/index.js");
    app.post("/albums", auth, album.create);
    app.post("/getAllUserAlbums", auth, album.getAllUserAlbums);
    app.delete("/albums", auth, album.delete);
    app.use('/albums', router);
}