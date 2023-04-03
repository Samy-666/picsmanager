module.exports = app => {
    const pictures = require("../controllers/pictures.controller.js");
    const router = require("express").Router();
    const auth = require("../middleware/index.js");
    app.post("/pictures", auth, pictures.upload);
    app.delete("/pictures", auth, pictures.delete)
    app.post("/getPicturesList", auth, pictures.getListOfAllPicturesFromAlbum);
    app.get("/pictures/:params", pictures.downloadPicture);
    app.use('/pictures', router);
}