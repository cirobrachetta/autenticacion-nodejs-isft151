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
    console.log(req.body);

    const { name, email, password, passwordConfirm } = req.body;

    DataBase.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => { 
        //de aca no entiendo el "async" ni tampoco de donde saca el results o el error
        if(error){
            console.log(error);
        }
        if(results.lenght > 0) {
            return res.render('register', {
                message: 'That Email is already in use'
            })
        }
        else if( password !== passwordConfirm){
            return res.render('register', {
                message: "The passwords do not match"
            })
        }

        let hashedPassword = await bcrypt.hash(password, 8); //aca no entiendo ni el "let" ni el "await"
        console.log(hashedPassword);

        DataBase.query('INSERT INTO users SET ?', {name: name, email: email, password: hashedPassword}, (error, results)=>{
            if(error){
                console.log(error);
            } else {
                console.log(results);

                return res.render('register', {
                    message: "User registerd"
                });
            }
        })
        //que es exactamente un query de SQL?

    })
}