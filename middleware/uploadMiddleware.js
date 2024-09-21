const multer = require('multer');  // Asegúrate de que multer esté importado correctamente
const path = require('path');
const { v4: uuidv4 } = require('uuid');  // Para generar UUID para el nombre del archivo

// Configurar multer para manejar la subida de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  // Asegúrate de que el directorio "uploads" existe
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);  // Obtiene la extensión del archivo
        const uniqueFilename = uuidv4() + extension;  // Genera un UUID con la extensión original
        cb(null, uniqueFilename);  // Guarda el archivo con el UUID como nombre
    }
});

// Instancia de multer
const upload = multer({ storage: storage });

module.exports = upload;