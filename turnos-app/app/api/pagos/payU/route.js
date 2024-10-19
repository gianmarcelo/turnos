import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { items, total, buyerEmail } = await request.json();

    const merchantId = process.env.NEXT_PUBLIC_MERCHANT_ID;
    const accountId = process.env.NEXT_PUBLIC_ACCOUNT_ID;
    const apiKey = process.env.API_KEY;
    //const description = 'Compra de créditos y/o plan';
    let description;
    if (items[0].tipo === 'plan') {
        description = `Compra de ${items[0].tipo} ${items[0].nombre}.`;
    } else {
        description = `Compra de ${items[0].cantidad} créditos`;
    }
    const referenceCode = `Ref-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    //const referenceCode = 'TestPayU';
    const currency = 'COP';

    // Validar datos
    if (!merchantId || !accountId || !apiKey || !buyerEmail || total <= 0) {
      return NextResponse.json({ error: 'Faltan datos de configuración o el total es inválido.' }, { status: 400 });
    }

    const amount = parseFloat(total).toFixed(0);
    const tax = 0;
    const taxReturnBase = amount;

    const signature = generateSignature(apiKey, merchantId, referenceCode, amount, currency);
    console.log(apiKey, merchantId, referenceCode, amount, currency);
    console.log(signature);

    const formHtml = `
      <form method="POST" action="https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/">
        <input name="merchantId" type="hidden" value="${merchantId}">
        <input name="accountId" type="hidden" value="${accountId}">
        <input name="description" type="hidden" value="${description}">
        <input name="referenceCode" type="hidden" value="${referenceCode}">
        <input name="amount" type="hidden" value="${amount}">
        <input name="tax" type="hidden" value="${tax}">
        <input name="taxReturnBase" type="hidden" value="${taxReturnBase}">
        <input name="currency" type="hidden" value="${currency}">
        <input name="signature" type="hidden" value="${signature}">
        <input name="test" type="hidden" value="1">
        <input name="buyerEmail" type="hidden" value="${buyerEmail}">
        <input name="responseUrl" type="hidden" value="${process.env.NEXT_PUBLIC_RESPONSE_URL}">
        <input name="confirmationUrl" type="hidden" value="${process.env.NEXT_PUBLIC_CONFIRMATION_URL}">
        <input name="Submit" type="submit" value="Enviar">
      </form>
      <script>
        document.forms[0].submit();
      </script>
    `;
    return NextResponse.json({ formHtml });
  } catch (error) {
    console.error('Error al procesar la solicitud de pago:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

const generateSignature = (apiKey, merchantId, referenceCode, amount, currency) => {
  const signatureString = `${apiKey}~${merchantId}~${referenceCode}~${amount}~${currency}`;
  return crypto.createHash('md5').update(signatureString).digest('hex');
};