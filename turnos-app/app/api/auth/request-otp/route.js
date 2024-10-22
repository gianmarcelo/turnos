import bcrypt from 'bcryptjs';
import { enviarMensaje } from '../../../utils/mensajes';
import { pool } from '../../../db';

export async function POST(req) {
  try {
    const { mobileNumber, loginMethod } = await req.json();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = await bcrypt.hash(otp, 10);

    // Guardar el OTP en la base de datos en la columna 'onetimepassword'
    const updateResult = await pool.query(
      'UPDATE clientes SET onetimepassword = $1 WHERE numberclient = $2',
      [hashedOtp, mobileNumber]
    );

    // Verificar si se actualizó algún registro
    if (updateResult.rowCount === 0) {
      return new Response(JSON.stringify({ success: false, message: 'Número móvil no registrado.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const mensaje = `Su código de verificación de acceso MiTurno es: ${otp}`;
    let envioExitoso = false;

    // Enviar mensaje según el método de inicio de sesión
    if (loginMethod === 'sms') {
      envioExitoso = await enviarMensaje(mobileNumber, mensaje, 'sms');
    } else if (loginMethod === 'whatsapp') {
      envioExitoso = await enviarMensaje(mobileNumber, mensaje, 'whatsapp');
      console.log(envioExitoso);
    }

    // Verificar si el mensaje fue enviado correctamente
    if (!envioExitoso) {
      return new Response(JSON.stringify({ success: false, message: 'Error al enviar el mensaje.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al enviar el código OTP:', error);
    return new Response(JSON.stringify({ success: false, message: 'Error en el servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
