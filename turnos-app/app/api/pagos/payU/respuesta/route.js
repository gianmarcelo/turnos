import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Pool } from 'pg';
import crypto from 'crypto';

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
    // Obtener el id_cliente de la base de datos
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
    let amount = parseFloat(searchParams.get('TX_VALUE')).toFixed(1); // Redondeo a 1 decimal como indica la documentación
    const paymentMethod = searchParams.get('lapPaymentMethod');
    const transactionId = searchParams.get('transactionId');
    const description = searchParams.get('description');
    //const fecha = new Date();
    //const paymentDate = new Date(fecha - fecha.getTimezoneOffset() * 60000).toISOString();
    const paymentDate = searchParams.get('processingDate');
    const currency = 'COP';

    // Validar firma
    const merchantId = searchParams.get('merchantId');
    const apiKey = process.env.API_KEY;
    const signatureReceived = searchParams.get('signature');
    const localSignature = crypto
      .createHash('md5')
      .update(`${apiKey}~${merchantId}~${referenceCode}~${amount}~${currency}~${transactionState}`)
      .digest('hex');

    if (localSignature !== signatureReceived) {
      return new Response(JSON.stringify({ error: 'Firma inválida' }), { status: 400 });
    }

    const formattedAmount = parseFloat(amount).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
    });

    // Obtener la URL base del host
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';

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
