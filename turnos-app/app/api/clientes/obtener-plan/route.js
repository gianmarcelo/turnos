import { Pool } from 'pg';
import { getServerSession } from 'next-auth'; 
import { authOptions } from '../../auth/[...nextauth]/route';
import crypto from 'crypto';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL_CLIENTES,
    client_encoding: 'UTF8'
});

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new Response(JSON.stringify({ error: 'No estás autenticado' }), { status: 401 });
    }

    const idCliente = session.user.id;
    const email = session.user.email;
    const client = await pool.connect();

    try {
        const res = await client.query(`SELECT * FROM clientes WHERE id_cliente = $1`, [idCliente]);
        const tipoplan = res.rows[0].tipoplan;
        
        const resTarifa = await client.query(`SELECT * FROM tarifas WHERE item = $1`, [tipoplan]);
        const valor = resTarifa.rows[0].valor;

        const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
        const description = `Pago mensualidad ${currentMonth} del plan ${tipoplan} MiTurno - ${res.rows[0].name}`;
        
        const resReference = await client.query(`SELECT * FROM transacciones_${idCliente} WHERE descripcion = $1 AND estadotransaccion = $2`, [description,'4']);
        let referencia;
        let referenceCode;

        if (resReference.rowCount === 0) {
            referencia = null;
            referenceCode = `Ref-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
        } else {
            referencia = resReference.rows[0];
            referenceCode = referencia.referenceCode;
        }

        return new Response(JSON.stringify({ tipoplan, valor, email, referencia, description, referenceCode }), { status: 200 });

    } catch (error) {
        console.error('Error al obtener las tarifas:', error);
        return new Response(JSON.stringify({ error: 'Error al obtener las tarifas' }), { status: 500 });
    } finally {
        client.release();
    }
}
