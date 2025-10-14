// import { Usuario } from '../models/usuario.js';

declare global {
    namespace Express {
        interface Request {
            usuario?: {
                id: number;
                nombre: string;
                email: string;
            };
        }
    }
}
export {};
