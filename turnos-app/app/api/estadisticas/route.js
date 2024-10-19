import { Pool } from 'pg';
import { getServerSession } from 'next-auth/next';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_MENSAJES,
});
const poolclientes = new Pool({
    connectionString: process.env.DATABASE_URL_CLIENTES,
  });

export async function GET(request) {
  const client = await pool.connect();
  const session = await getServerSession(request);
  const email = session.user.email; 
  const res = await poolclientes.query('SELECT * FROM clientes WHERE email = $1', [email]);
  const clientData = res.rows[0];
  const idCliente = clientData.id_cliente;

  try {
    // Query para obtener horas pico
    const resultHora = await client.query(`
        SELECT EXTRACT(HOUR FROM TO_TIMESTAMP("FechaHora", 'YYYY-MM-DD"T"HH24:MI:SS.MSZ')) AS hour, COUNT(*) AS total_messages
        FROM mensajes_${idCliente}
        WHERE "Estatus" = 'Entregado'
        GROUP BY hour
        ORDER BY total_messages DESC
      `);
      
    // Query para obtener datos por día
    const resultDia = await client.query(`
      SELECT DATE("FechaHora") AS day, COUNT(*) AS total_messages
      FROM mensajes_${idCliente}
      WHERE "Estatus" = 'Entregado'
      GROUP BY day
      ORDER BY day
    `);

    // Query para obtener datos por mes
    const resultMes = await client.query(`
        SELECT DATE_TRUNC('month', TO_TIMESTAMP("FechaHora", 'YYYY-MM-DD"T"HH24:MI:SS.MSZ')) AS month, COUNT(*) AS total_messages
        FROM mensajes_${idCliente}
        WHERE "Estatus" = 'Entregado'
        GROUP BY month
        ORDER BY month
      `);      
      
    // Query para obtener datos por año
    const resultAno = await client.query(`
      SELECT DATE_TRUNC('year', TO_TIMESTAMP("FechaHora", 'YYYY-MM-DD"T"HH24:MI:SS.MSZ')) AS year, COUNT(*) AS total_messages
      FROM mensajes_${idCliente}
      WHERE "Estatus" = 'Entregado'
      GROUP BY year
      ORDER BY year
    `);

    return new Response(JSON.stringify({
      mensajesPorDia: resultDia.rows,
      mensajesPorMes: resultMes.rows,
      mensajesPorAno: resultAno.rows,
      horasPico: resultHora.rows,
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching statistics' }), { status: 500 });
  } finally {
    client.release();
  }
}
