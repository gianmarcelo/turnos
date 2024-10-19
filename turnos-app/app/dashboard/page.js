import Link from 'next/link';
import 'tailwindcss/tailwind.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route'; 

const Dashboard = async () => {
  const session = await getServerSession(authOptions); 

  // Si no hay sesión, redirige al usuario a la página de inicio de sesión
  if (!session) {
    return (
      <div>
        <h1>Redirigiendo...</h1>
        {/* Aquí puedes agregar un componente de redirección más amigable */}
        {typeof window !== 'undefined' && (window.location.href = '/auth/signin')}
      </div>
    );
  }

  return (
    <div className="flex">
      <nav className="w-64 bg-gray-800 text-white h-screen p-4">
        <ul>
          <li className="mb-4"><Link href="/dashboard">Inicio</Link></li>
          <li className="mb-4"><Link href="/dashboard/estadisticas">Estadísticas</Link></li>
          <li className="mb-4"><Link href="/dashboard/configuracion">Configuración</Link></li>
          <li className="mb-4"><Link href="/dashboard/estado-cuenta">Seguridad y pagos</Link></li>
          <li className="mb-4"><Link href="/dashboard/acerca">Acerca de</Link></li>
        </ul>
      </nav>
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Bienvenido al Dashboard</h1>
        <p>Selecciona una opción en el panel lateral.</p>
      </main>
    </div>
  );
};

export default Dashboard;
