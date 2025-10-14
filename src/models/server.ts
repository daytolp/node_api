import cors from 'cors';
import express, { type Application } from 'express';
import usersRoutes from '../routes/usuarios.routes.js';
import db from '../database/connection/connection.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

class Server {
    private app: Application;
    private port: string;
    private apiPaths = {
        usuarios: '/api/usuarios'
    };

    constructor() {
        this.app = express();
        this.port = process.env.PORT || '8000';
        // TODO: BD conexion
        this.middlewares();
        this.routes();
        this.registerErrorHandler(); // registrar el manejador de errores global
        this.dbConnection();
    }

    async dbConnection() {
        try {
            await db.authenticate();
            console.log('Base de datos online');
        } catch (error) {
            console.log('Error en la base de datos: ', error);
        }
    }

    middlewares() {
        this.app.use(cors());
        this.app.use(express.json());//para manejar la comunicacion por el protocol http con json 
        this.app.use(express.static('public'));//carpeta se llama public

        const __filename = fileURLToPath(import.meta.url); // <-- agregado
        const __dirname = path.dirname(__filename);
        this.app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));//Especificar la ruta donde se guardaran las imagenes
        // this.app.use((req, _res, next) => {
        //     console.log(`[REQ] ${req.method} ${req.url}`); // <-- DEBUG: ver todas las solicitudes
        //     next();
        // });
        this.app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction): void => {
            console.log('Paso por aqui.');
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    res.status(400).json({
                        error: 'El archivo es demasiado grande. Tamaño máximo permitido es 2MB.'
                    });
                    return;
                }
                console.log('Error 400 (multer) -> ', err);
                res.status(400).json({
                    error: err.message
                });
                return;
            }

            if (err) {
                console.log('Error 500 -> ', err);
                res.status(500).json({
                    error: err.message
                });
                return;
            }
            next(); // si no hay error continua con la siguiente request
        });
    }

    routes() {
        this.app.use(this.apiPaths.usuarios, usersRoutes);
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en puerto', this.port);
        });
    }

    // agregar este middleware después de routes()
    registerErrorHandler() {
        this.app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction): void => {
            console.error('ERROR GLOBAL:', err);
            const status: number = err?.status || err?.statusCode || 500;
            const message = err?.message || 'Internal Server Error';
            if (process.env.NODE_ENV === 'production') {
                res.status(status).json({ error: message });
            } else {
                res.status(status).json({
                    error: message,
                    // incluir stack y detalles SQL si existen (útil para debugging)
                    stack: err?.stack,
                    sqlMessage: err?.parent?.sqlMessage ?? err?.original ?? undefined
                });
            }
        });
    }

}

export default Server;
