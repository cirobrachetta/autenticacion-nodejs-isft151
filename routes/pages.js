const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.get("/register", (req, res) => {
    res.render("register");
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/DashBoard', (req, res) => {
    res.render('DashBoard');
});

router.get('/upload-music', (req, res) => {
    res.render('upload-music');
  });

module.exports = router;