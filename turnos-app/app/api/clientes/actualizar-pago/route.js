// api/clientes/actualizar-datos.js
import { NextResponse } from 'next/server';
import { pool } from 'tu-conexion-postgres';

export async function POST(request) {
  const { nuevoPlan, carrito } = await request.json();

  // Actualizar los créditos y el plan en la base de datos
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN'); // Iniciar transacción

    if (nuevoPlan) {
      // Reemplaza créditos si se compra un plan
      await client.query('UPDATE clientes SET creditosmes = $1 WHERE id = $2', [0, idCliente]); // Asegúrate de obtener el ID del cliente
    }

    for (const item of carrito) {
      if (item.tipo === 'creditos') {
        // Sumar créditos a los existentes
        await client.query('UPDATE clientes SET creditosmes = creditosmes + $1 WHERE id = $2', [item.cantidad, idCliente]);
      }
    }

    await client.query('COMMIT'); // Confirmar transacción
    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK'); // Revertir transacción en caso de error
    console.error('Error al actualizar la base de datos:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar la base de datos' });
  } finally {
    client.release(); // Liberar el cliente
  }
}
