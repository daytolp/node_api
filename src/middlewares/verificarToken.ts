import type { Request, Response, NextFunction } from 'express';

import { type JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '../config/configJwt.js';
import jwt from 'jsonwebtoken';

export const verificarToken = async (req: Request, res: Response, next: NextFunction) => {
    console.log("req header: ", req.headers)
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log("Token: ", token);
    if (!token) {
        res.status(401).json({
            msg: 'No hay token en la petición'
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {id:number, email:string, nombre:string};
        req.usuario = {
            id: decoded.id,
            nombre: decoded.nombre,
            email: decoded.email
        };
        next();
    } catch (error) {
        console.error('Error al verificar el token:', error);
        res.status(401).json({
            msg: 'Token no válido'
        });
    }
};
