import bcrypt from 'bcryptjs';
import { getPool } from '../../../db';

export async function POST(req) {
  try {
    const { mobileNumber, otp } = await req.json();

    // Buscar el OTP almacenado en la base de datos
    const result = await getPool.query(
      'SELECT onetimepassword FROM clientes WHERE numberclient = $1',
      [mobileNumber]
    );

    // Verificar si existe un OTP almacenado
    const storedOtp = result.rows[0]?.onetimepassword;
    if (!storedOtp) {
      return new Response(JSON.stringify({ success: false, error: 'Código no encontrado' }), {
        status: 404, // Status adecuado para recurso no encontrado
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Comparar el OTP proporcionado con el almacenado utilizando bcrypt
    const isMatch = await bcrypt.compare(otp, storedOtp);
    
    if (isMatch) {
      // Eliminar el OTP de la base de datos después de la verificación exitosa
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ success: false, error: 'Código incorrecto' }), {
        status: 400, 
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error al validar el código OTP:', error);
    return new Response(JSON.stringify({ message: 'Error interno del servidor' }), {
      status: 500, 
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
