const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth');

const authenticateToken = require('../middleware/authMiddleware');



router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/upload-music', authenticateToken, authController.uploadMusic);

router.get('/upload', authenticateToken, authController.viewUploadedMusic);   // GET para ver la música subida

module.exports = router;