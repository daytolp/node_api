import dotenv from 'dotenv';
import Server from './models/server.js';
dotenv.config();//trae las variables de entorno del archivo .env

export const server = new Server();
server.listen();


