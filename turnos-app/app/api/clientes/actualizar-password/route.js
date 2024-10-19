import { Pool } from 'pg'; 
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth'; // Asegúrate de tener la sesión configurada
import { authOptions } from '../../auth/[...nextauth]/route';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_CLIENTES,
});

export async function POST(req) {
  const { passwordAnterior, nuevoPassword } = await req.json();
  const session = await getServerSession(authOptions);

  // Verifica que el usuario esté autenticado
  if (!session) {
    return new Response(JSON.stringify({ error: 'No estás autenticado' }), { status: 401 });
  }

  const email = session.user.email;

  const client = await pool.connect();

  try {
    // 1. Obtener la contraseña almacenada en la base de datos
    const res = await client.query(`SELECT password FROM clientes WHERE email = $1`, [email]);
    const user = res.rows[0];

    if (!user) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 404 });
    }

    const passwordAlmacenada = user.password;

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(nuevoPassword, salt);
    
    // 2. Comparar la contraseña anterior
    const isMatch = await bcrypt.compare(passwordAnterior,passwordAlmacenada);

    if (!isMatch) {
      return new Response(JSON.stringify({ error: 'La contraseña anterior es incorrecta', password: passwordAlmacenada }), { status: 403 });
    }

    // 3. Hashear la nueva contraseña
    
    // 4. Actualizar la nueva contraseña en la base de datos
    await client.query(`UPDATE clientes SET password = $1 WHERE email = $2`, [hashedNewPassword, email]);

    return new Response(JSON.stringify({ message: 'Contraseña actualizada correctamente', password: hashedNewPassword, email: email }), { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la contraseña.');
    return new Response(JSON.stringify({ error: 'Error al actualizar la contraseña', password: null }), { status: 500 });
  } finally {
    client.release();
  }
}
