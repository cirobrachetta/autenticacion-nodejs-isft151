// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.cookies.jwt; // Puedes obtener el token de las cookies o de los encabezados
    if (!token) {
        return res.status(401).send('Access Denied');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send('Invalid Token');
        }
        req.user = user; // Establece el usuario decodificado en la solicitud
        next();
    });
};

module.exports = authenticateToken;
