const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL_CLIENTES,
  });
  

const closePool = async () => {
    await pool.end();
    console.log('Conexiones al pool cerradas.');
  };
  
  module.exports = { pool, closePool };