import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_CLIENTES,
});

export async function GET() {
  const client = await pool.connect();
  try {
    // Realizar la consulta para obtener las tarifas
    const res = await client.query('SELECT item, creditos, valor FROM tarifas');
    const tarifas = res.rows;

    return new Response(JSON.stringify(tarifas), { status: 200 });
  } catch (error) {
    console.error('Error al obtener las tarifas:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener las tarifas' }), { status: 500 });
  } finally {
    client.release();
  }
}
