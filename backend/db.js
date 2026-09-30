const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

pool.on('connect', () => {
    console.log('Conexión con PostgreSQL establecida correctamente.');
});

pool.on('error', (error) => {
    console.error('Error inesperado en PostgreSQL:', error);
});

module.exports = pool;