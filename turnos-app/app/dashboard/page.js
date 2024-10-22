import Link from 'next/link';
import 'tailwindcss/tailwind.css';
import LogoutButton from './LogoutButton'; // Importa el componente de logout
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route'; 
import { redirect } from 'next/navigation'; // Usa redirect de Next.js

const Dashboard = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/signin'); // Redirige automáticamente si no hay sesión
  }

  return (
    <div className="flex">
      <nav className="w-64 bg-gray-800 text-white h-screen p-4">
        <ul>
          <li className="mb-4"><Link href="/dashboard">Inicio</Link></li>
          <li className="mb-4"><Link href="/dashboard/estadisticas">Estadísticas</Link></li>
          <li className="mb-4"><Link href="/dashboard/configuracion">Configuración</Link></li>
          <li className="mb-4"><Link href="/dashboard/estado-cuenta">Seguridad y Compras</Link></li>
          <li className="mb-4"><Link href="/dashboard/historial">Historial de transacciones</Link></li>
          <li className="mb-4"><Link href="/dashboard/pagos">Pagos</Link></li>
          <li className="mb-4"><Link href="/dashboard/acerca">Acerca de</Link></li>
          <li className="mt-8">
            <LogoutButton />
          </li>
        </ul>
      </nav>
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Bienvenido al panel de control - MiTurno</h1>
        <p>Selecciona una opción en el panel lateral.</p>
      </main>
    </div>
  );
};

export default Dashboard;
