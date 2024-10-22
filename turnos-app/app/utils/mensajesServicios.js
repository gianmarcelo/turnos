export async function enviarMensajePorWhatsApp(numeroMovil, mensaje) {
    const json = {
      messaging_product: "whatsapp",
      to: numeroMovil,
      type: 'text',
      text: { body: mensaje },
    };
  
    const response = await fetch(`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
      },
      body: JSON.stringify(json),
    });
    const result = await response.json();
    if (result && result.messages && result.messages.length > 0) {
        return { success: true }
    }
  }  

export async function enviarMensajePorSMS(numeroMovil, mensaje) {
  const data = {
    addresses: [numeroMovil],
    message: mensaje,
    target_device_iden: process.env.PUSHBULLET_TARGET_DEVICE_IDEN,
  };

  const response = await fetch("https://api.pushbullet.com/v2/texts", {
    method: "POST",
    headers: {
      "Access-Token": process.env.PUSHBULLET_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data }),
  });

  return await response.json();
}