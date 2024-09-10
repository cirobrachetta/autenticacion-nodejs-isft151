const mysql = require("mysql");

const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');

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

            const cookieOptions = {
                expires: new Date(
                    Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                ),
                httpOnly: true
            };

            res.cookie('jwt', token, cookieOptions);
            res.status(200).redirect("/DashBoard");
        }
    });
};

exports.uploadMusic = (req, res) => {
    const { album_name, album_description, file_name } = req.body;
    const userId = req.user.id;  // Suponiendo que el ID del usuario está almacenado en req.user tras la autenticación

    if (!album_name || !album_description || !file_name) {
        return res.status(400).render('upload', {
            message: 'Todos los campos son obligatorios'
        });
    }

    try {
        // Insertamos el álbum en la tabla music
        DataBase.query('INSERT INTO music (album_name, album_description, file_path) VALUES (?, ?, ?)', 
        [album_name, album_description, file_name], (error, results) => {
            if (error) {
                console.log("Error al insertar en tabla music: ", error);
                return res.status(500).render('upload', {
                    message: 'Error al cargar la música'
                });
            }

            // Obtenemos el ID de la música recién insertada
            const musicId = results.insertId;

            // Insertamos en la tabla intermedia user_music para relacionar al usuario con la música
            DataBase.query('INSERT INTO user_music (user_id, music_id) VALUES (?, ?)', [userId, musicId], (error, results) => {
                if (error) {
                    console.log("Error al insertar en tabla user_music: ", error);
                    return res.status(500).render('upload', {
                        message: 'Error al asociar la música con el usuario'
                    });
                }

                // Todo ha salido bien
                res.status(200).render('upload', {
                    message: 'Música cargada y asociada exitosamente'
                });
            });
        });

    } catch (error) {
        console.log("Error en la carga de música: ", error);
        res.status(500).render('upload', {
            message: 'Error en la carga de música'
        });
    }
};