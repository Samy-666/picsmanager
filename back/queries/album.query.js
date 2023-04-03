const pool = require('../db.js')

const Album = function (album) {
    this.album_name = album.album_name;
    this.created_on = album.created_on;
    this.user_id = album.user_id;
}

Album.getAllUserAlbums = (id_user, result) => {
    
    let query = `SELECT * FROM albums WHERE user_id = ${id_user}`;
    pool.query(query, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        console.log("albums: ", res.rows);
        result(null, res.rows);
    });
}


Album.create = (newAlbum, result) => {
    pool.query('INSERT INTO albums (album_name, created_on, user_id) VALUES ($1, $2, $3)', [newAlbum.album_name, newAlbum.created_on, newAlbum.user_id], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        console.log("created album: ", { id: res.insertId, ...newAlbum });
        result(null, { id: res.insertId, ...newAlbum });
    });
}

Album.delete = (id_album, result) => {
    let query = `DELETE FROM albums WHERE album_id = ${id_album}`;
    pool.query(query, (err, res) => {
        if (err) {

            console.log("error: ", err);
            result(null, err);
            return;
        }
        if (res.rowCount == 0) {
            // not found Picture with the id
            result({ kind: "not_found" }, null);
            return;
        }
        console.log("deleted album with id: ", id_album);
        result(null, res);
    });
}



module.exports = Album;