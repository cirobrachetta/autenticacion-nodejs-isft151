// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.cookies.jwt;

    // Si no hay token, redirigir al login
    if (!token) {
        return res.status(401).redirect('/login');
    }

    // Verificar el token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).redirect('/login');  // Si el token es inválido o expirado, redirigir al login
        }

        req.user = decoded;  // Guardar la información del usuario en la solicitud
        next();  // Pasar al siguiente middleware o ruta
    });
};

module.exports = authenticateToken;