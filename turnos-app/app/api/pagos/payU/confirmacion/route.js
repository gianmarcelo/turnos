import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  const formData = await request.formData();

  const merchantId = formData.get('merchantId');
  const referenceCode = formData.get('reference_sale');
  const transactionState = formData.get('state_pol');
  const value = formData.get('value');
  const signatureReceived = formData.get('sign');
  const apiKey = process.env.API_KEY;

  // Generar firma local para validación
  const localSignature = crypto
    .createHash('md5')
    .update(`${apiKey}~${merchantId}~${referenceCode}~${value}~COP~${transactionState}`)
    .digest('hex');

  // Validar la firma
  if (localSignature !== signatureReceived) {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 });
  }

  // Procesar la confirmación del pago
  if (transactionState === '4') {
    // Pago exitoso, actualizar base de datos o procesar lo que sea necesario
  } else {
    // Pago fallido o pendiente
  }

  return NextResponse.json({ message: 'Confirmación recibida correctamente' });
}
