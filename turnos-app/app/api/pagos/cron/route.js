import cron from 'node-cron';
import { updateCredits, verifyMonthlyPayments } from '@/app/lib/payments';

// Ejecutar el cron a las 0 horas del primer y sexto día de cada mes
cron.schedule('0 0 1 * *', async () => {
  console.log('Actualizando créditos del plan mensual...');
  await updateCredits();
});

cron.schedule('0 0 6 * *', async () => {
  console.log('Verificando pagos del mes...');
  await verifyMonthlyPayments();
});

export async function GET() {
  return new Response('Cron jobs configurados.', { status: 200 });
}
