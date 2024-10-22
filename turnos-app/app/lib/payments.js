import { pool } from '../db';

export async function updateCredits() {
  const query = `
    UPDATE clientes
    SET creditosmes = (SELECT creditos FROM tarifas WHERE tarifas.item = clientes.tipoplan)
    WHERE tipoplan IS NOT NULL;
  `;
  await pool.query(query);
}

export async function verifyMonthlyPayments() {
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const query = `
    SELECT id_cliente, name, tipoplan
    FROM clientes
    WHERE statuspago != 'Activo';
  `;

  const clientes = await pool.query(query);

  for (const cliente of clientes.rows) {
    const reference = `Pago mensualidad ${currentMonth} del plan ${cliente.tipoplan} - ${cliente.name}`;
    const transaccionQuery = `
      SELECT estadotransaccion 
      FROM transacciones_${clientes.rows[0].idcliente} 
      WHERE referencia = $1 AND estadotransaccion = 4;
    `;
    const transaccion = await pool.query(transaccionQuery, [reference]);

    const newStatus = transaccion.rowCount > 0 ? 'Activo' : 'Inactivo';
    const updateQuery = `
      UPDATE clientes
      SET statuspago = $1
      WHERE id_cliente = $2;
    `;
    await pool.query(updateQuery, [newStatus, cliente.id_cliente]);
  }
}
