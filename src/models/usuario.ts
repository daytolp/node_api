import { DataTypes } from 'sequelize';
import db from '../database/connection/connection.js';

const Usuario = db.define('Usuario', {
    nombre: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
        unique: true
    },
    password: {
        type: DataTypes.STRING
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: true
    },
    estado: {
        type: DataTypes.INTEGER
    }
});

export default Usuario;
