const mysql = require("mysql");

const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');

const path = require('path');

const { v4: uuidv4 } = require('uuid');

const DataBase = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    pasword: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
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
            res.status(401).render('login', {
                message: 'Email or Password is incorrect'
            });
        } else {
            const id = results[0].id;
            const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });

            // Configurar la cookie JWT sin expires ni maxAge
            const cookieOptions = {
                httpOnly: true,  // Solo accesible desde HTTP (no JavaScript)
                sameSite: true,  // Protección CSRF
                secure: process.env.NODE_ENV === 'production'  // Solo en HTTPS en producción
            };

            res.cookie('jwt', token, cookieOptions);
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
exports.uploadMusic = (req, res) => {
    const { album_name, album_description, artist, song_name } = req.body;
    const userId = req.user.id;
    const file_name = req.file ? req.file.filename : null;

    if (!album_name || !album_description || !artist || !song_name || !file_name) {
        return res.status(400).render('music-upload', {
            message: 'Todos los campos son obligatorios'
        });
    }

    try {
        // Verificar si la canción ya existe para este usuario
        DataBase.query('SELECT * FROM music INNER JOIN user_music ON music.id = user_music.music_id WHERE music.artist = ? AND music.song_name = ? AND user_music.user_id = ?', 
        [artist, song_name, userId], (error, results) => {
            if (error) {
                console.log("Error al verificar si la canción ya existe: ", error);
                return res.status(500).render('upload-music', {
                    message: 'Error al verificar la canción en la base de datos'
                });
            }

            // Si ya existe una canción con el mismo artista y nombre para este usuario, devolver un error
            if (results.length > 0) {
                return res.status(400).render('upload-music', {
                    message: 'Ya has subido esta canción antes'
                });
            }

            // Si no existe, proceder con la inserción
            DataBase.query('INSERT INTO music (album_name, album_description, artist, song_name, file_path) VALUES (?, ?, ?, ?, ?)', 
            [album_name, album_description, artist, song_name, path.join('uploads', file_name)], (error, results) => {
                if (error) {
                    console.log("Error al insertar en la tabla 'music': ", error);
                    return res.status(500).render('upload-music', {
                        message: 'Error al cargar la música'
                    });
                }

                const musicId = results.insertId;

                // Insertar en la tabla intermedia 'user_music' para asociar la música con el usuario
                DataBase.query('INSERT INTO user_music (user_id, music_id) VALUES (?, ?)', [userId, musicId], (error, results) => {
                    if (error) {
                        console.log("Error al insertar en la tabla 'user_music': ", error);
                        return res.status(500).render('upload-music', {
                            message: 'Error al asociar la música con el usuario'
                        });
                    }

                    // Redirigir a la página de visualización de canciones subidas
                    res.redirect('/upload');
                });
            });
        });

    } catch (error) {
        console.log("Error en la carga de música: ", error);
        res.status(500).render('upload-music', {
            message: 'Error en la carga de música'
        });
    }
};
exports.viewUploadedMusic = (req, res) => {
    const userId = req.user.id;  // Asegúrate de que el ID del usuario esté disponible

    // Consulta SQL para obtener las canciones subidas por el usuario
    DataBase.query(
        'SELECT music.album_name, music.album_description, music.file_path FROM music INNER JOIN user_music ON music.id = user_music.music_id WHERE user_music.user_id = ?', 
        [userId], 
        (error, results) => {
            if (error) {
                console.log("Error al obtener la música del usuario: ", error);
                return res.status(500).render('upload', { message: 'Error al obtener la música' });
            }

            // Verificar si se encontraron resultados y renderizar la vista con los resultados
            if (results.length > 0) {
                res.render('upload', { musicList: results });
            } else {
                // Renderizar la vista sin resultados
                res.render('upload', { musicList: [] });
            }
        }
    );
};