const ftp = require('ftp');
const dayjs = require('dayjs');
const sharp = require('sharp');
const Picture = require('../queries/picture.query.js');
const jwt_decode = require('jwt-decode');
const jwt = require('jsonwebtoken');

exports.getListOfAllPicturesFromAlbum = (req, res) => {
  const token = req.headers["x-access-token"]
  let id_user = ''; 
  // decode token
 const key = "yHCBW76lh9B/kvPioDcRNhaAnflxIBwncYw6YvzzHZ7mIIF8U8R1O9rXmahVEJ3r"
  // decode token 

    jwt.verify(token, key, function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        id_user = decoded.id;
    }
  });

  
  const id_album = req.body.id_album;
  if (id_user == null || id_user == undefined || id_user == '') {
    res.status(400).send({
      message: "User can not be empty!"
    });
    return;
  }
  if (id_album == null || id_album == undefined || id_album == '') {
    res.status(400).send({
      message: "Id album can not be empty!"
    });

    return;
  }
  Picture.getAllPicturesFromTheAlbum(id_album, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving pictures."
      });
    } else {
      let result = [];
      data.forEach(element => {
        result.push(element.url);
      });
      console.log(result)
      res.send(result);
    }
  });
};

exports.downloadPicture = (req, res) => {
  const client = new ftp();
  const params = req.params.params;
  const id_user = params.split('&')[0]
  const id_album = params.split('&')[1]
  const picture_name = params.split('&')[2]

  if (id_user == null || id_user == undefined || id_user == '') {
    res.status(400).send({
      message: "User can not be empty!"
    });
    return;
  }
  if (id_album == null || id_album == undefined || id_album == '') {
    res.status(400).send({
      message: "Id album can not be empty!"
    });
    return;
  }

  if (picture_name == null || picture_name == undefined || picture_name == '') {
    res.status(400).send({
      message: "Picture name can not be empty!"
    });
    return;
  }
  client.connect({
    host: 'localhost',
    user: 'sam',
    password: 'root'
  });

  client.on('ready', () => {
    client.get(id_user.toString() + '/' + id_album.toString() + '/' + picture_name, (err, stream) => {
      if (err) {
        console.log(`FTP error: ${err.message}`);
        res.statusCode = 500;
        res.end();
      } else {
        res.on('error', (err) => {
          console.log(`Response error: ${err.message}`);
          stream.destroy();
        });
        res.on('close', () => {
          if (stream) {
            stream.destroy();
          }
        });
        stream.pipe(res);
      }
    });
    client.end(() => {
      console.log('FTP connection closed');
    });
  });
};

exports.upload = (req, res) => {
  const client = new ftp();
  const params = req.files.json.data;
  const paramsDecode = JSON.parse(params);

  let id_user = paramsDecode.id_user;
  let id_album = paramsDecode.id_album;
  let picture_name = paramsDecode.picture_name;

  if (id_user == null || id_user == undefined || id_user == '') {
    res.status(400).send({
      message: "User can not be empty!"
    });

    return;
  }

  if (id_album == null || id_album == undefined || id_album == '') {
    res.status(400).send({
      message: "Id album can not be empty!"
    });

    return;
  }

  const file = req.files.myFile;
  const fileName = file.name;
  const fileExtension = fileName.split('.').pop();
  const fileNameWithoutExtension = fileName.replace(`.${fileExtension}`, '');
  const newFileName = id_user + '-' + id_album + '-' + Date.now() + '-' + fileNameWithoutExtension + '.png';

  const created_on = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const url = 'https://localhost:3000/pictures/' + id_user.toString() + '&' + id_album.toString() + '&' + newFileName;
  const picture = new Picture({
    url: url,
    picture_name: picture_name,
    create_on: created_on,
    album_id: id_album
  });


  Picture.create(picture, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the picture."
      });
    }
    else {
      client.connect({
        host: 'localhost',
        user: 'sam',
        password: 'root'
      });
      sharp(file.data)
        .png()
        .jpeg({ quality: 50 })
        .resize(250, 250)
        .toBuffer()
        .then(data => {
          const path = id_user.toString() + '/' + id_album.toString() + '/' + newFileName;
          client.on('ready', () => {
            client.mkdir(id_user.toString(), true, (error) => {
              if (error) {
                console.error('Error creating folder on FTP server:', error);
              } else {
                console.log('First Folder created successfully');
                client.mkdir(id_user.toString() + '/' + id_album.toString(), true, (error) => {
                  if (error) {
                    console.error('Error creating folder on FTP server:', error);
                  } else {
                    console.log('Second Folder created successfully');
                    client.put(data, path, (error) => {
                      if (error) {
                        console.error('Error uploading file to FTP server:', error);
                        res.status(500).send('Error uploading file to FTP server');
                      } else {
                        console.log('File uploaded successfully');
                        res.status(200).send('File uploaded successfully');

                      }
                    })
                  }
                })
              }
            })
          })
        })
        .catch(err => {
          console.log(err);
        })
    }
  });
};

exports.delete = (req, res) => {
  let url = '';
  const id_picture = req.body.id_picture;

  if (id_picture == null || id_picture == undefined || id_picture == '') {
    res.status(400).send({
      message: "Id picture can not be empty!"
    });

    return;
  }
  Picture.findById(id_picture, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Picture with id ${id_picture}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Picture with id " + id_picture
        });
      }
    } else {
      const path = data.url;
      url = path
    }
    let path = url.split('/');
    let id_user = path[3];
    let id_album = path[4];
    let picture_name = path[5];

    client.delete(id_user + '/' + id_album + '/' + picture_name, (error) => {
      if (error) {
        console.error('Error deleting file on FTP server:', error);
        res.status(500).send('Error deleting file on FTP server');
      } else {
        console.log('File deleted successfully');
        Picture.delete(id_picture, (err, data) => {
          if (err) {
            if (err.kind === "not_found") {
              res.status(404).send({
                message: `Not found Picture with id ${id_picture}.`
              });
            } else {
              res.status(500).send({
                message: "Error retrieving Picture with id " + id_picture
              });
            }
          } else {
            res.status(200).send(data);
          }
        });
      }
    })
  });


}

