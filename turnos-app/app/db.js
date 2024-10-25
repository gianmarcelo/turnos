import { Pool } from 'pg';

let pool = new Pool({
  connectionString: process.env.DATABASE_URL_CLIENTES,
  client_encoding: 'UTF8'
});

export const closePool = async () => {
  if (pool) {
    try {
      await pool.end();
      pool = null; // Asegurarte de que el pool se elimine después de cerrarlo
    } catch (error) {
      console.error("Error al cerrar el pool:", error);
    }
  } else {
    console.warn("El pool ya está cerrado o no existe.");
  }
};

export const getPool = () => {
  if (!pool) {
    throw new Error("El pool ya fue cerrado. No se puede realizar consultas.");
  }
  return pool;
};

export { pool };
