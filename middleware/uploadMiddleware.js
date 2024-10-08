const multer = require('multer');  // Asegúrate de que multer esté importado correctamente
const path = require('path');
const { v4: uuidv4 } = require('uuid');  // Para generar UUID para el nombre del archivo
const fs = require('fs');

// Configurar multer para manejar la subida de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/';
        // Verifica si el directorio existe, si no, lo crea
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);  // Guarda en el directorio uploads
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);  // Obtiene la extensión del archivo
        const uniqueFilename = uuidv4() + extension;  // Genera un UUID con la extensión original
        cb(null, uniqueFilename);  // Guarda el archivo con el UUID como nombre
    }
});

// Instancia de multer
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /mp3|mp4/;  // Tipos de archivo permitidos
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());  // Verifica la extensión
        const mimetype = filetypes.test(file.mimetype);  // Verifica el tipo MIME
    
        // Verifica el tipo MIME manualmente para mp4
        const validMimes = ['audio/mpeg', 'video/mp4']; // Tipos MIME válidos para mp3 y mp4
        const isMimeValid = validMimes.includes(file.mimetype);
    
        if (extname && (mimetype || isMimeValid)) {
            return cb(null, true);  // Archivo válido
        } else {
            cb(new Error('Tipo de archivo no válido.'));  // Error de tipo de archivo
        }
    }
});

// Exporta las funciones para diferentes tipos de carga
module.exports = {
    uploadSingle: upload.single('file_name_single'),  // Para un solo archivo (sencillo)
    uploadArrayEP: upload.array('file_name_ep', 5),    // Para múltiples archivos (máx. 5 para EPs)
    uploadArrayAlbum: upload.array('file_name_album', 12)  // Para múltiples archivos (máx. 12 para álbumes)
};