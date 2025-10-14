import { Sequelize } from 'sequelize';

  const db = new Sequelize('nodejs_curso', 'root', 'root', {
            host: 'localhost',
            dialect: 'mysql'
        });

export default db;