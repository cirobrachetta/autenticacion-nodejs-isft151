const mysql = require("mysql");

const DataBase = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    pasword: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.register = (req, res) => {
    console.log(req.body);

    const { name, email, password, passwordConfirm } = req.body;

    DataBase.query('SELECT email FROM users WHERE email = ?', [email], (error, results) => {
        if(error){
            console.log(error);
        }
        if(results.lenght > 0) {
            return res.render('register', {
                message: "That Email is already in use"
            })
        }
        else if( password !== passwordConfirm){
            return res.render('register', {
                message: "The passwords do not match"
            })
        }
    })

    res.send("form submitted")
}