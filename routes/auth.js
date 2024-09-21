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

router.post('/upload-music', authenticateToken, upload.single('file_name'), authController.uploadMusic);  // Usa el middleware de multer aquí

router.get('/upload', authenticateToken, authController.viewUploadedMusic);   // GET para ver la música subida

module.exports = router;