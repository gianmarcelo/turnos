// Archivo: /app/api/pagos/payU/respuesta/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Asegúrate de que este sea el path correcto
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_CLIENTES,
});

export async function GET(request) {
  // Obtener la sesión en el servidor
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: 'No estás autenticado' }), { status: 401 });
  }
  const email = session?.user?.email;
  const client = await pool.connect();

  try {
    // 1. Obtener id_cliente de la base de datos
    const res = await client.query(`SELECT id_cliente FROM clientes WHERE email = $1`, [email]);
    const user = res.rows[0];

    if (!user) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 404 });
    }

    const idCliente = user.id_cliente;

    if (!idCliente) {
      return new Response(JSON.stringify({ error: 'Cliente no existe o no está activo.' }), { status: 403 });
    }

    const { searchParams } = new URL(request.url);
  
    const transactionState = searchParams.get('transactionState');
    const referenceCode = searchParams.get('referenceCode');
    const transactionId = searchParams.get('transactionId');
    const paymentMethod = searchParams.get('lapPaymentMethod');
    const paymentDate = new Date().toISOString();
    let amount = searchParams.get('TX_VALUE');
    amount = parseInt(amount);

    // 4. Actualizar la base de datos
    await client.query(
      `INSERT INTO transacciones_${idCliente} 
        (fechatransaccion, estadotransaccion, idtransaccion, referencia, total, metodopago) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [paymentDate, transactionState, transactionId, referenceCode, amount, paymentMethod]
    );

    // Formatear el monto en COP
    const formattedAmount = parseFloat(amount).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
    });

    // Obtener la URL base del host
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http'; // Si está en producción, puede usar https

    // Construir URL absoluta para la redirección
    const redirectUrl = `${protocol}://${host}/dashboard/resultado-transaccion?estado=${transactionState}&referencia=${referenceCode}&monto=${formattedAmount}&transaccion=${transactionId}&metodoPago=${paymentMethod}&fechaPago=${paymentDate}`;

    // Redirigir a la página de resultado con la URL completa
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error al actualizar la base de datos.', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar la base de datos' }), { status: 500 });
  } finally {
    client.release();
  }
}
