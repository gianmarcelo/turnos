import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';

export const POST = async (req, res) => {
  const { email, subject, message } = await req.json();

  // Validar los campos
  if (!email || !subject || !message) {
    return new Response(JSON.stringify({ error: 'Todos los campos son obligatorios' }), {
      status: 400,
    });
  }

  // Configurar transporte de Nodemailer con Mailgun
  const auth = {
    auth: {
      api_key: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
    },
  };

  const transporter = nodemailer.createTransport(mg(auth));

  try {
    // Enviar el correo
    await transporter.sendMail({
      from: process.env.EMAIL_FROM, // De quién es el correo
      to: process.env.EMAIL_TO, // A quién va el correo
      subject: `Contacto: ${subject}`,
      text: message,
      replyTo: email, // El correo del usuario
    });

    return new Response(JSON.stringify({ success: 'Mensaje enviado con éxito' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return new Response(JSON.stringify({ error: 'Error al enviar el mensaje' }), {
      status: 500,
    });
  }
};
