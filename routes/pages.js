const express = require('express');

const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');

router.get('/', (req, res) => {
    res.render('index');
});

router.get("/register", (req, res) => {
    res.render("register");
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/DashBoard', authenticateToken, (req, res) => {
    res.render('DashBoard', {
        user: req.user  // Puedes pasar los datos del usuario si los necesitas en la vista
    });
});

router.get('/upload-music', (req, res) => {
    res.render('upload-music');
});

router.get('/upload', (req, res) => {
    res.render('upload');
});

module.exports = router;