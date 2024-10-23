import Image from 'next/image'; // Importa el componente Image de Next.js
import Link from 'next/link';
import 'tailwindcss/tailwind.css';
import LogoutButton from './LogoutButton'; 
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route'; 
import { redirect } from 'next/navigation'; 

const Dashboard = async () => {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin'); 
  }

  return (
    <div className="flex min-h-screen">
      {/* Panel lateral de navegación */}
      <nav className="w-64 bg-gray-800 text-white h-screen p-4">
        <ul>
          <li className="mb-4"><Link href="/dashboard">Inicio</Link></li>
          <li className="mb-4"><Link href="/dashboard/estadisticas">Estadísticas</Link></li>
          <li className="mb-4"><Link href="/dashboard/configuracion">Configuración</Link></li>
          <li className="mb-4"><Link href="/dashboard/estado-cuenta">Seguridad y Compras</Link></li>
          <li className="mb-4"><Link href="/dashboard/historial">Historial de transacciones</Link></li>
          <li className="mb-4"><Link href="/dashboard/pagos">Pagos</Link></li>
          <li className="mb-4"><Link href="/dashboard/contactanos">Contáctanos</Link></li>
          <li className="mt-8">
            <LogoutButton />
          </li>
        </ul>
      </nav>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Logo de la empresa */}
        <div className="mb-8">
          <Image
            src="/images/Logo_MiTurno_318x318.png" // Ruta a la imagen
            alt="Logo de MiTurno"
            width={200}
            height={200}
            className="rounded-lg shadow-lg"
          />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-center">Bienvenido al panel de control - MiTurno</h1>

        

        {/* Breve presentación de la empresa */}
        <p className="text-lg text-gray-600 text-center max-w-xl">
          MiTurno es una plataforma diseñada para optimizar la gestión de turnos y reservas de 
          servicios. Con nuestra herramienta, los negocios pueden mejorar la eficiencia en la 
          administración de citas y los clientes pueden disfrutar de una experiencia más fluida y 
          sin complicaciones.
        </p>

        <p className="mt-4 text-lg text-gray-600 text-center max-w-xl">
          Explora las opciones del panel lateral para configurar tus servicios, revisar el historial 
          de transacciones y gestionar pagos de manera rápida y segura.
        </p>
      </main>
    </div>
  );
};

export default Dashboard;
