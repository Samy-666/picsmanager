const Album = require('../queries/album.query.js');
const dayjs = require('dayjs');
const client = require('../ftp');


exports.create = (req, res) => {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }
    const album = new Album({
        album_name: req.body.album_name,
        created_on: now,
        user_id: req.body.user_id
    });

    Album.create(album, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the album."
            });
        else res.send(data);
    });
}


exports.getAllUserAlbums = (req, res) => {
    const id_user = req.body.id_user;
    Album.getAllUserAlbums(id_user, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found album with id ${req.params.album_id}.`
                });
            } else {
                res.status(500).send({
                    message: "Could not delete album with id " + req.params.album_id
                });
            }
        } else res.send(data);
    });
}



exports.delete = (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }
    const id_album = req.body.id_album;
    const id_user = req.body.id_user;
    client.rmdir(id_user + '/' + id_album, true, (error) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Directory deleted successfully');
            Album.delete(id_album, (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(404).send({
                            message: `Not found album with id ${req.params.album_id}.`
                        });
                    } else {
                        res.status(500).send({
                            message: "Could not delete album with id " + req.params.album_id
                        });
                    }
                } else res.send({ message: `album was deleted successfully!` });
            });
        }
    });




}