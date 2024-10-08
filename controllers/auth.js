const mysql = require("mysql");

const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');

const path = require('path');

const { v4: uuidv4 } = require('uuid');

const DataBase = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    pasword: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    charset: 'utf8_unicode_ci'  // Asegúrate de que esto esté configurado
});

exports.register = (req, res) => {
    //console.log(req.body);

    const { name, email, password, passwordConfirm } = req.body;
    try {
            DataBase.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => { 
            //de aca no entiendo el "async" ni tampoco de donde saca el results o el error
            console.log("resultado: ", results.code);
            console.log("salida de error: " + error);
            if(error){
                console.log(error);
            }
            if(results.code == 'ER_DUP_ENTRY') {
                return res.render('register', {
                    message: 'That Email is already in use'
                })
            }
            else if( password !== passwordConfirm){
                return res.render('register', {
                    message: "The passwords do not match"
                })
            }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

         DataBase.query('INSERT INTO users SET ?', {name: name, email: email, password: hashedPassword}, (error, results)=>{
        //     console.log("salida error: ", results);
             if(error){
                return res.render('register', {
                    message: ' That Email is already in use'
                })
                console.log(error.errno, "Error 3");
            } else {
                 console.log(results);

                 return res.render('register', {
                     message: "User registerd"
                 });
             }
         })
        //que es exactamente un query de SQL?

    })
    } catch (error) {
        console.log(error, "error de catch");
    }
}

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).render('login', {
            message: 'Please provide an email and password'
        });
    }

    DataBase.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
        if (!results || results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            return res.status(401).render('login', {
                message: 'Email or Password is incorrect'
            });
        } else {
            const id = results[0].id;
            const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                expiresIn: '15m'  // Expira en 15 minutos
            });

            const cookieOptions = {
                httpOnly: true,
                sameSite: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 15 * 60 * 1000  // Expira en 15 minutos (900000 ms)
            };

            res.cookie('jwt', token, cookieOptions);

            // Redirigir al DashBoard y establecer el sessionStorage desde el frontend
            res.status(200).redirect("/DashBoard");
        }
    });
};

exports.logout = (req, res) => {
    // Limpiar la cookie JWT configurándola con una fecha de expiración en el pasado
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),  // La cookie expira inmediatamente
        sameSite: true,        // Protección contra CSRF
        secure: process.env.NODE_ENV === 'production'  // Solo para HTTPS en producción
    });

    // Redirigir al usuario a la página de inicio de sesión después del logout
    res.status(200).redirect('/login');
};


// Controlador para subir música
// Controlador para subir sencillos
exports.uploadSingle = (req, res) => {
    const song = req.file;  // Archivo de la canción subido
    if (!song) {
        return res.status(400).send('No se ha subido ninguna canción.');
    }

    // Inserta la canción como sencillo en la tabla 'songs'
    const songData = {
        song_name: req.body.song_name,
        file_path: song.path.replace(/\\/g, '/'),
        artist: req.body.artist || 'Desconocido'
    };

    DataBase.query('INSERT INTO songs SET ?', songData, (err, songResult) => {
        if (err) {
            console.error('Error al guardar el sencillo: ', err);
            return res.status(500).send('Error al guardar el sencillo.');
        }

        const songId = songResult.insertId; // ID de la canción recién creada

        // Relaciona la canción con el usuario en 'user_songs'
        DataBase.query('INSERT INTO user_songs (user_id, song_id) VALUES (?, ?)', [req.user.id, songId], (err) => {
            if (err) {
                console.error('Error al relacionar el sencillo con el usuario: ', err);
                return res.status(500).send('Error al relacionar el sencillo con el usuario.');
            }

            res.status(200).redirect('/upload');  // Redirige al ver las canciones subidas
        });
    });
};

// Controlador para subir EPs
exports.uploadEP = (req, res) => {
    const songs = req.files;  // Archivos de las canciones subidas
    if (!songs || songs.length === 0) {
        return res.status(400).send('No se han subido canciones.');
    }

    // Inserta el EP en la tabla 'eps'
    const epData = {
        album_name: req.body.album_name,
        album_description: req.body.album_description || ''
    };

    DataBase.query('INSERT INTO eps SET ?', epData, (err, epResult) => {
        if (err) {
            console.error('Error al guardar el EP: ', err);
            return res.status(500).send('Error al guardar el EP.');
        }

        const epId = epResult.insertId; // ID del EP recién creado

        // Relaciona el EP con el usuario en 'user_eps'
        DataBase.query('INSERT INTO user_eps (user_id, ep_id) VALUES (?, ?)', [req.user.id, epId], (err) => {
            if (err) {
                console.error('Error al relacionar el EP con el usuario: ', err);
                return res.status(500).send('Error al relacionar el EP con el usuario.');
            }
        });

        songs.forEach(song => {
            const songData = {
                song_name: song.originalname,
                file_path: song.path.replace(/\\/g, '/'),
                artist: req.body.artist || 'Desconocido'
            };

            DataBase.query('INSERT INTO songs SET ?', songData, (err, songResult) => {
                if (err) {
                    console.error('Error al guardar la canción: ', err);
                    return res.status(500).send('Error al guardar la canción.');
                }

                const songId = songResult.insertId;

                // Relaciona la canción con el EP en 'ep_songs'
                DataBase.query('INSERT INTO ep_songs (ep_id, song_id) VALUES (?, ?)', [epId, songId], (err) => {
                    if (err) {
                        console.error('Error al asociar la canción con el EP: ', err);
                        return res.status(500).send('Error al asociar la canción con el EP.');
                    }
                });
            });
        });

        res.status(200).redirect('/upload');  // Redirige al ver las canciones subidas
    });
};

// Controlador para subir Álbumes
exports.uploadAlbum = (req, res) => {
    const songs = req.files;  // Archivos de las canciones subidas
    if (!songs || songs.length === 0) {
        return res.status(400).send('No se han subido canciones.');
    }

    // Inserta el álbum en la tabla 'albums'
    const albumData = {
        album_name: req.body.album_name,
        album_description: req.body.album_description || ''
    };

    DataBase.query('INSERT INTO albums SET ?', albumData, (err, albumResult) => {
        if (err) {
            console.error('Error al guardar el álbum: ', err);
            return res.status(500).send('Error al guardar el álbum.');
        }

        const albumId = albumResult.insertId; // ID del álbum recién creado

        // Relaciona el álbum con el usuario en 'user_albums'
        DataBase.query('INSERT INTO user_albums (user_id, album_id) VALUES (?, ?)', [req.user.id, albumId], (err) => {
            if (err) {
                console.error('Error al relacionar el álbum con el usuario: ', err);
                return res.status(500).send('Error al relacionar el álbum con el usuario.');
            }
        });

        songs.forEach(song => {
            const songData = {
                song_name: song.originalname,
                file_path: song.path.replace(/\\/g, '/'),
                artist: req.body.artist || 'Desconocido'
            };

            DataBase.query('INSERT INTO songs SET ?', songData, (err, songResult) => {
                if (err) {
                    console.error('Error al guardar la canción: ', err);
                    return res.status(500).send('Error al guardar la canción.');
                }

                const songId = songResult.insertId;

                // Relaciona la canción con el álbum en 'album_songs'
                DataBase.query('INSERT INTO album_songs (album_id, song_id) VALUES (?, ?)', [albumId, songId], (err) => {
                    if (err) {
                        console.error('Error al asociar la canción con el álbum: ', err);
                        return res.status(500).send('Error al asociar la canción con el álbum.');
                    }
                });
            });
        });

        res.status(200).redirect('/upload');  // Redirige al ver las canciones subidas
    });
};