import { closePool } from '../../../db'; // Ajusta la ruta según tu estructura

export async function POST(req, res) {
  try {
    // Cierra el pool de conexiones antes de cerrar sesión
    await closePool();
    
    return new Response(JSON.stringify({ message: 'Sesión cerrada y conexiones al pool cerradas.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al cerrar el pool:', error);
    return new Response(JSON.stringify({ error: 'Error al cerrar el pool de conexiones.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
