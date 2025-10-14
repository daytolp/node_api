import * as mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let connectionMysql: mysql.Connection | null = null;

const getConnection = async (): Promise< mysql.Connection | null> => {
    try {
        if (!connectionMysql) {
            const host = requiredEnv('DB_HOST');
            const user = requiredEnv('DB_USER');
            const password = requiredEnv('DB_PASSWORD');
            const database = requiredEnv('DB_NAME');

            connectionMysql = await mysql.createConnection({
                host,
                user,
                password,
                database,
                multipleStatements: true
            });
            console.log('Conexión establecida correctamente');
        }
        return connectionMysql;
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        throw error;
    }   
};

function requiredEnv(name: string): string {
    const val = process.env[name];
    if (!val) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return val;
}

export default getConnection;
