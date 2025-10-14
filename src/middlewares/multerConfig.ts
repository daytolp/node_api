import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        const __filename = fileURLToPath(import.meta.url); // <-- agregado
        const __dirname = path.dirname(__filename);
        cb(null, path.join(__dirname, '../../uploads'));//carpeta donde se guardaran las imagenes
    },
    filename: (_, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);//subfijo unico
        const extention = path.extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${extention}`;
        console.log('Nombre genereado para el archivo -> ' + filename);
        cb(null, filename);
    }
});

const upload = multer({ 
    storage, 
    limits: {fileSize: 2 *1024 * 1024}, //limite de 2MB
    fileFilter: (_, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype: boolean = filetypes.test(file.mimetype);
        const extname: boolean = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Tipo de archivo no permitido.'));
    }
});

export default upload;
