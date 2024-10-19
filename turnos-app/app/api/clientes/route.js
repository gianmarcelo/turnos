import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth/next';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_CLIENTES,
});

export async function GET(request) {
  const session = await getServerSession(request);
  
  if (!session || !session.user.email) {
    return NextResponse.json({ error: 'Email no proporcionado' }, { status: 401 });
  }

  const email = session.user.email; 

  try {
    const res = await pool.query('SELECT * FROM clientes WHERE email = $1', [email]);
    const clientData = res.rows[0];

    if (!clientData) {
      return NextResponse.json({ error: 'No se encontraron datos del cliente' }, { status: 404 });
    }

    return NextResponse.json(clientData);
  } catch (error) {
    console.error('Error en la consulta a la base de datos', error);
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 });
  }
}


export async function PUT(req) {
  const { nombreEstablecimiento, sucursal, numeroMovil, mensajeTurno, preguntaEncuesta } = await req.json();
  const session = await getServerSession(req);
  const email = session.user.email; 
  const client = await pool.connect();
  
  try {
    await client.query(
      `UPDATE clientes SET name = $1, sucursal = $2, numberclient = $3, mensajeturno = $4, preguntaencuesta = $5 WHERE email = $6`,
      [nombreEstablecimiento, sucursal, numeroMovil, mensajeTurno, preguntaEncuesta, email]
    );
    return NextResponse.json({ message: 'Cliente actualizado' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar el cliente' }, { status: 500 });
  } finally {
    client.release();
  }
}