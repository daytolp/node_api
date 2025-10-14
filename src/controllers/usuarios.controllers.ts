import { type NextFunction, type Request, type Response } from 'express';
import Usuario from '../models/usuario.js';
import fs from 'fs/promises';
import bcrypt from 'bcryptjs';
import path from 'path';
import { Op } from 'sequelize';
import getConnection from '../database/connection/connectionQuery.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/configJwt.js';
export const getUsuarios = async (_req: Request, res: Response, next: NextFunction) => {
    console.log('obteniendo usuarios.');
    try {
        const usuarios = await Usuario.findAll({ attributes: { exclude: ['password'] } });
        console.log(usuarios);
        return res.json(usuarios);
    } catch (error) {
        return next(error);
    }
};

export const getUsuario = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const usuario = await Usuario.findByPk(id, { attributes: { exclude: ['password'] } });
        if (!usuario) {
            return res.status(404).json({
                msg: 'Usuario no encontrado',
                id
            });
        }

        return res.json(usuario);
    } catch (error) {
        return next(error);
    }
};


export const saveUsuario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('guardar usuario');
    try {
        const { body } = req;
        const { nombre, email, password } = body;

        if (!email || !nombre || !password) {
            res.status(400).json({
                msg: 'Todos los campos (nombre, email, password) son obligatorios',
                body
            });
            return;
        }
        
        const usuarioExist = await Usuario.findOne({ where: { email } });
        
        if (usuarioExist) {
            if (req.file) {
                await fs.unlink(path.resolve(req.file.path));
            }
            res.status(400).json({
                msg: 'Ya existe un usuario con el email: ' + email
            });
            return;
        }
        
        if (req.file) {
            body.imagen = req.file.filename;
        } else {
            body.imagen = null;
        }

        const salt = await bcrypt.genSaltSync(10);
        body.password = await bcrypt.hashSync(password, salt);
        
        const usuario = await Usuario.build(body);
        console.log('usuario: ', usuario);
        await usuario.save();
       
        const { password: _, ...usuarioData } = usuario.toJSON();
        
        res.status(201).json(usuarioData);
    } catch (error) {
        console.error('Error -> ', error);
        return next(error);
    }
};
export const updateUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { body } = req;

        const usuario = await Usuario.findByPk(id);
       if (!usuario) {
           res.status(404).json({
               msg: 'Usuario no encontrado',
           });
           return;
       }

        const usuarioJson = usuario?.toJSON();
        if (body.email) {
            const usuarioExiste = await Usuario.findOne({ where: { email: body.email, id: { [Op.ne]:id} } });
            if (usuarioExiste) {
                res.status(400).json({
                    msg: 'Ya existe un usuario con el email: ' + body.email
                });

                if (req.file) {
                    await fs.unlink(path.resolve(req.file.path));//como en la configuracion de multer ya se subio el archivo, y aqui el usuario ya tiene un email repetido, se borra la imagen que se subio
                }
                return;
            }
        }

        if (req.file) {
            const nuevaImagen = req.file.filename;
            if (usuarioJson?.email) {
                const imagenAntigua = usuarioJson.imagen;
                if (imagenAntigua) {
                    const pathImagenAntigua = path.resolve('./uploads/' + imagenAntigua);
                    try {
                        await fs.unlink(pathImagenAntigua);//elimina la imagen anterior del usuario
                    } catch (error) {
                        console.error('Error al eliminar la imagen anterior del usuario: ' + pathImagenAntigua, error);
                    }
                }
            }
            body.imagen = nuevaImagen;
        } else {
            delete body.imagen;
        }

        if (body.password) {
            const salt = await bcrypt.genSaltSync(10);
            body.password = await bcrypt.hashSync(body.password, salt);
            
        }

        await usuario.update({ ...body });
        const { password: _, ...usuarioData } = usuario.toJSON();
        res.status(200).json(usuarioData);
    } catch (error) {
       console.error('Error -> ', error);
       res.status(500).json({
           error: 'Error interno del servidor'
       });
    }
};

export const deleteUsuario = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const connection = await getConnection();
        const [rows] = await connection!.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        if ((rows as any[]).length === 0) {
            return res.status(404).json({
                msg: 'Usuario no encontrado en BD.'
            });
        }

        const { imagen } = (rows as any[])[0];
        if (imagen) {
            const pathImagen = path.resolve('./uploads/' + imagen);  
            try {
                await fs.unlink(pathImagen);//elimina la imagen anterior del usuario
                console.log('Imagen eliminada del servidor');
                 await connection!.query('DELETE FROM usuarios WHERE id = ?', [id]);
                res.status(200).json({
                    msg: 'Usuario eliminado de BD y su imagen del servidor',
                });
            } catch (error) {
                console.error('Error al eliminar la imagen del usuario: ' + pathImagen, error);
            }
        }
       
    } catch (error) {
        return next(error);
    }
};

export const loginUsuario = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const usuario = await Usuario.findOne({ where: { email } });
        const usuarioJson = usuario?.toJSON();
        if (!usuario) {
            res.status(404).json({
                msg: 'Usuario / Password no son correctos'
            });
            return;
        }

        const isMatch = await bcrypt.compare(password, usuarioJson.password);
      
        if (!isMatch) {
            res.status(400).json({
                msg: 'Usuario / Password no son correctos'
            });
            return;
        }

        const token = jwt.sign({ id: usuarioJson.id, email: usuarioJson.email, nombre: usuarioJson.nombre }, JWT_SECRET, { expiresIn: '2h' });
        res.status(200).json({
            msg: 'Login ok',
            token
        });
    } catch (error) {
        console.log('Error en el servidor -> ', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};