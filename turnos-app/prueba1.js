const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgres://postgres:1Laurit@@localhost:5432/clientes_db',
    client_encoding: 'UTF8'
});


async function prueba() {
    const client = await pool.connect();
    try {
        const res = await client.query(`UPDATE tarifas SET item = 'Básico' WHERE item = $1;` ,['Basico']);
        console.log(res.rowCount); // Muestra el número de filas afectadas
    } finally {
        client.release();
    }
}

prueba().catch(err => console.error('Error ejecutando la consulta', err.stack));



