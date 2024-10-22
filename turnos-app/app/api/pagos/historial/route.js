import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_CLIENTES,
});

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'No estás autenticado' }, { status: 401 });
  }

  const email = session?.user?.email;
  const client = await pool.connect();

  try {
    const res = await client.query('SELECT id_cliente FROM clientes WHERE email = $1', [email]);
    const user = res.rows[0];

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const idCliente = user.id_cliente;

    if (!idCliente) {
      return NextResponse.json({ error: 'Cliente no existe o no está activo.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    console.log(fechaInicio,fechaFin);
    const query = `
      SELECT * FROM transacciones_${idCliente}
      WHERE fechatransaccion >= $1 AND fechatransaccion <= $2
      ORDER BY fechatransaccion DESC
    `;
    const transacciones = await client.query(query, [fechaInicio, fechaFin]);

    return NextResponse.json(transacciones.rows);
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    return NextResponse.json({ error: 'Error al obtener transacciones' }, { status: 500 });
  } finally {
    client.release();
  }
}