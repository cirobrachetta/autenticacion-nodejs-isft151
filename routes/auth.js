const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth');

const authenticateToken = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');  // Importa el middleware de subida



router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/logout', authController.logout);

router.get('/DashBoard', authenticateToken, (req, res) => {
    res.render('DashBoard', { user: req.user });
});



// Rutas POST para manejar la subida de archivos
router.post('/upload-single', authenticateToken, upload.uploadSingle, authController.uploadSingle);

router.post('/upload-ep', authenticateToken, upload.uploadArrayEP, authController.uploadEP);

router.post('/upload-album', authenticateToken, upload.uploadArrayAlbum, authController.uploadAlbum);


module.exports = router;