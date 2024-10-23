import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
      let transporter = nodemailer.createTransport({
        service: 'Gmail', // Puedes cambiarlo por tu servicio de email
        auth: {
          user: process.env.EMAIL_USER, // Tu correo electrónico
          pass: process.env.EMAIL_PASSWORD, // Tu contraseña de correo electrónico
        },
      });

      await transporter.sendMail({
        from: email, // El email del usuario
        to: process.env.EMAIL_TO, // Tu correo donde recibirás los mensajes
        subject: `Contacto: ${subject}`,
        text: message,
      });

      return res.status(200).json({ success: 'Mensaje enviado con éxito' });
    } catch (error) {
      return res.status(500).json({ error: 'Error al enviar el mensaje' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
