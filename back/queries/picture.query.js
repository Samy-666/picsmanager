const pool = require('../db.js')
const Picture = function (picture) {
     this.url = picture.url.toString();
     this.picture_name = picture.picture_name;
     this.create_on = picture.create_on;
     this.album_id = picture.album_id;
}


Picture.create = (newPicture, result) => {
     pool.query('INSERT INTO pictures (url, create_on, album_id, picture_name) VALUES ($1, $2, $3, $4)', [newPicture.url, newPicture.create_on, newPicture.album_id, newPicture.picture_name], (err, res) => {
          if (err) {
               console.log("error: ", err);
               result(err, null);
               return;
          }
          console.log("created picture: ", { id: res.insertId, ...newPicture });
          result(null, { id: res.insertId, ...newPicture });
     });
}

Picture.getAllPicturesFromTheAlbum = (id_album, result) => {
     pool.query('SELECT * FROM pictures WHERE album_id = $1', [id_album], (err, res) => {
          if (err) {
               console.log("error: ", err);
               result(null, err);
               return;
          }
          console.log("pictures: ", res.rows);
          result(null, res.rows);
     });
}

Picture.findById = (pictureId, result) => {
     pool.query('SELECT * FROM pictures WHERE picture_id = $1', [pictureId], (err, res) => {

          if (err) {
               console.log("error: ", err);
               result(err, null);
               return;
          }
          if (res.rowCount == 0) {
               // not found Picture with the id
               result({ kind: "not_found" }, null);
               return;
          }
          // found Picture with the id
          console.log("found picture: ", res.rows[0]);
          result(null, res.rows[0]);
     });
}


Picture.delete = (id_picture, result) => {

     pool.query('DELETE FROM pictures WHERE picture_id = $1', [id_picture], (err, res) => {
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
          console.log("deleted picture with id: ", id_picture);
          result(null, res);
     });
}

module.exports = Picture;