import { pool } from '../../../db';

export async function POST(req) {
  try {
    const { mobileNumber } = await req.json();

    const query = 'SELECT COUNT(*) FROM clientes WHERE numberclient = $1';
    const values = [mobileNumber];
    const result = await pool.query(query, values);

    if (result.rows[0].count > 0) {
      return new Response(JSON.stringify({ exists: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ exists: false }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error al verificar el número móvil:', error);
    return new Response(JSON.stringify({ exists: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}