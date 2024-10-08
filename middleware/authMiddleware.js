const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).redirect('/login');  // Redirigir si no hay token
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).redirect('/login');  // Redirigir si el token es inválido o ha expirado
        }

        req.user = decoded;  // Guardar los datos del usuario decodificado en la solicitud
        next();  // Pasar al siguiente middleware o ruta
    });
};

module.exports = authenticateToken;
