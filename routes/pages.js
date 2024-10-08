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

// Rutas para subir sencillos, EPs y discos
router.get('/upload-single', authenticateToken, (req, res) => {
    res.render('upload-single', {
        user: req.user  // Puedes pasar los datos del usuario si los necesitas en la vista
    });  // Vista para subir sencillos
});

router.get('/upload-ep', authenticateToken, (req, res) => {
    res.render('upload-ep', {
        user: req.user  // Puedes pasar los datos del usuario si los necesitas en la vista
    });  // Vista para subir EP
});

router.get('/upload-album', authenticateToken, (req, res) => {
    res.render('upload-album', {
        user: req.user  // Puedes pasar los datos del usuario si los necesitas en la vista
    });  // Vista para subir álbumes
});


router.get('/upload', (req, res) => {
    res.render('upload');
});

module.exports = router;