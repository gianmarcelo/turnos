import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { total, buyerEmail, referenceCode, description } = await request.json();

    const merchantId = process.env.NEXT_PUBLIC_MERCHANT_ID;
    const accountId = process.env.NEXT_PUBLIC_ACCOUNT_ID;
    const apiKey = process.env.API_KEY;
    const currency = 'COP';

    if (!merchantId || !accountId || !apiKey || !buyerEmail || total <= 0) {
      return NextResponse.json({ error: 'Faltan datos de configuración o el total es inválido.' }, { status: 400 });
    }

    const amount = parseFloat(total).toFixed(0);
    
    const signature = generateSignature(apiKey, merchantId, referenceCode, amount, currency);

    const formHtml = `
      <form method="POST" action="https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/">
        <input name="merchantId" type="hidden" value="${merchantId}">
        <input name="accountId" type="hidden" value="${accountId}">
        <input name="description" type="hidden" value="${description}">
        <input name="referenceCode" type="hidden" value="${referenceCode}">
        <input name="amount" type="hidden" value="${amount}">
        <input name="currency" type="hidden" value="${currency}">
        <input name="signature" type="hidden" value="${signature}">
        <input name="test" type="hidden" value="0">
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
    return NextResponse.json({ error: 'Error en el proceso de pago.' }, { status: 500 });
  }
}

function generateSignature(apiKey, merchantId, referenceCode, amount, currency) {
  const hashString = `${apiKey}~${merchantId}~${referenceCode}~${amount}~${currency}`;
  const hash = crypto.createHash('md5').update(hashString).digest('hex');
  return hash;
}
