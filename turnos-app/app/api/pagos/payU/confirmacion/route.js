import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import crypto from 'crypto';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_CLIENTES,
});

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: 'No estás autenticado' }), { status: 401 });
  }

  const email = session?.user?.email;
  const formData = await request.formData();

  const merchantId = formData.get('merchantId');
  const referenceCode = formData.get('reference_sale');
  const transactionState = formData.get('state_pol');
  let amount = parseFloat(formData.get('value')).toFixed(1); // Redondear como en la documentación
  const currency = formData.get('currency');
  const signatureReceived = formData.get('sign');
  const apiKey = process.env.API_KEY;

  // Generar la firma local para validar la recibida
  const localSignature = crypto
    .createHash('md5')
    .update(`${apiKey}~${merchantId}~${referenceCode}~${amount}~${currency}~${transactionState}`)
    .digest('hex');

  console.log(localSignature, signatureReceived);
  if (localSignature !== signatureReceived) {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 });
  }

  const transactionId = formData.get('transaction_id');
  const description = formData.get('description');
  const paymentMethod = formData.get('payment_method_name');
  const paymentDate = formData.get('transaction_date');

  const client = await pool.connect();

  try {
    // Registrar la transacción en la tabla de logs, incluso si no fue exitosa
    await client.query(
      `INSERT INTO logs_transacciones 
        (email, fechatransaccion, estadotransaccion, idtransaccion, referencia, total, metodopago, descripcion) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [email, paymentDate, transactionState, transactionId, referenceCode, amount, paymentMethod, description]
    );

    // Actualizar la base de datos solo si la transacción es exitosa (estado 4)
    if (transactionState === '4') {
      const res = await client.query(`SELECT id_cliente FROM clientes WHERE email = $1`, [email]);
      const user = res.rows[0];

      if (!user) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      }

      const idCliente = user.id_cliente;

      if (!idCliente) {
        return new Response(JSON.stringify({ error: 'Cliente no existe o no está activo.' }), { status: 403 });
      }

      await client.query(
        `INSERT INTO transacciones_${idCliente} 
          (fechatransaccion, estadotransaccion, idtransaccion, referencia, total, metodopago, descripcion) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [paymentDate, transactionState, transactionId, referenceCode, amount, paymentMethod, description]
      );
    } else {
      console.log(`Transacción no exitosa. Estado: ${transactionState}`);
    }

    return NextResponse.json({ message: 'Confirmación recibida correctamente' });
  } catch (error) {
    console.error('Error al actualizar la base de datos.', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar la base de datos' }), { status: 500 });
  } finally {
    client.release();
  }
}
