"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';
import 'tailwindcss/tailwind.css';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

const handleLogout = () => {
  signOut({ callbackUrl: '/auth/signin' }); // Redirigir al usuario a la página de inicio de sesión
};

export default function Configuracion() {
  const router = useRouter();
  const [nombreEstablecimiento, setNombreEstablecimiento] = useState('');
  const [sucursal, setSucursal] = useState('');
  const [numeroMovil, setNumeroMovil] = useState('');
  const [tipoPlan, setTipoPlan] = useState('Básico'); 
  const [creditosmes, setCreditos] = useState('Básico');
  const [estadoPago, setEstadoPago] = useState('');
  const [mensajeTurno, setMensajeTurno] = useState('');
  const [preguntaEncuesta, setPreguntaEncuesta] = useState('');
  const [isProPlan, setIsProPlan] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      if (!session) {
        router.push('/auth/signin'); // Redirige a la página de inicio de sesión si no hay sesión
      }
    };

    fetchSession();
  }, [router]);

  // Cargar datos del cliente
  useEffect(() => {
    const fetchClientData = async () => {
      const response = await fetch('/api/clientes');
      if (!response.ok) {
        console.error('Error fetching client data');
        return;
      }
      const clientData = await response.json();
      setNombreEstablecimiento(clientData.name);
      setSucursal(clientData.sucursal);
      setNumeroMovil(clientData.numberclient);
      setTipoPlan(clientData.tipoplan); // Cargar tipo de plan desde la base de datos
      setEstadoPago(clientData.statuspago);
      setMensajeTurno(clientData.mensajeturno);
      setCreditos(clientData.creditosmes);
      setPreguntaEncuesta(clientData.preguntaencuesta); // Asegúrate de que este campo esté en la tabla de clientes
      setIsProPlan(clientData.tipoplan === 'Pro');
    };

    fetchClientData();
  }, []);

  // Habilitar pregunta de encuesta solo si el plan es Pro
  useEffect(() => {
    setIsProPlan(tipoPlan === 'Pro');
  }, [tipoPlan]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!mensajeTurno.endsWith('turno')) {
      alert('El mensaje de solicitud de turno debe finalizar con "turno".');
      return;
    }

    if (numeroMovil && !numeroMovil.startsWith('57')) {
      alert('El número móvil debe comenzar con el código de país 57.');
      return;
    }

    const confirm = window.confirm("¿Seguro que deseas guardar los cambios?");
    console.log(confirm);
    if (confirm) {
      // Aquí es donde deberías actualizar la información en la base de datos.
      console.log({
        nombreEstablecimiento,
        sucursal,
        numeroMovil,
        mensajeTurno,
        preguntaEncuesta,
      });
      
      // Envío de datos a tu API para guardar cambios
      const response = await fetch('/api/clientes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombreEstablecimiento,
          sucursal,
          numeroMovil,
          mensajeTurno,
          preguntaEncuesta,
        }),
      });
      console.log(response);
      if (response.ok) {
        alert('Configuración actualizada correctamente.');
      } else {
        alert('Error al actualizar la configuración.');
      }
    }
  };

  return (
    <div className="flex">
      <nav className="w-64 bg-gray-800 text-white min-h-screen p-4">
        <ul>
          <li className="mb-4"><Link href="/dashboard">Inicio</Link></li>
          <li className="mb-4"><Link href="/dashboard/estadisticas">Estadísticas</Link></li>
          <li className="mb-4"><Link href="/dashboard/configuracion">Configuración</Link></li>
          <li className="mb-4"><Link href="/dashboard/estado-cuenta">Seguridad y Compras</Link></li>
          <li className="mb-4"><Link href="/dashboard/historial">Historial de transacciones</Link></li>
          <li className="mb-4"><Link href="/dashboard/pagos">Pagos</Link></li>
          <li className="mb-4"><Link href="/dashboard/acerca">Acerca de</Link></li>
          <li className="mt-8">
            <button onClick={handleLogout} className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            <img src="/images/logout-icon.png" alt="Cerrar sesión" className="w-6 h-6 mr-2" />
            Cerrar Sesión
            </button>
          </li>
        </ul>
      </nav>
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Configuración<br /></h1>
        <h2 className="text-xl font-semibold mb-4">Hola, {nombreEstablecimiento}!</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Nombre del Establecimiento</label>
            <input
              type="text"
              value={nombreEstablecimiento}
              onChange={(e) => setNombreEstablecimiento(e.target.value)}
              className="border p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Sucursal</label>
            <input
              type="text"
              value={sucursal}
              onChange={(e) => setSucursal(e.target.value)}
              className="border p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Número Móvil (incluye el código de país 57)</label>
            <input
              type="tel"
              value={numeroMovil}
              onChange={(e) => setNumeroMovil(e.target.value)}
              className="border p-2 w-full"
              required
              pattern="^57[0-9]{10}$" // Aseguramos que tenga el código de país
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Tipo de Plan</label>
            <input
              type="text"
              value={tipoPlan}
              readOnly
              className="border p-2 w-full bg-gray-100 cursor-not-allowed" // Solo lectura
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Créditos disponibles</label>
            <input
              type="text"
              value={creditosmes}
              readOnly
              className="border p-2 w-full bg-gray-100 cursor-not-allowed" // Solo lectura
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Estado de Pago</label>
            <input
              type="text"
              value={estadoPago}
              readOnly
              className="border p-2 w-full bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Mensaje de Solicitud de Turno (debe terminar con "turno")</label>
            <input
              type="text"
              value={mensajeTurno}
              onChange={(e) => setMensajeTurno(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </div>
          {isProPlan && (
            <div className="mb-4">
              <label className="block mb-2">Pregunta de Encuesta Final</label>
              <input
                type="text"
                value={preguntaEncuesta}
                onChange={(e) => setPreguntaEncuesta(e.target.value)}
                className="border p-2 w-full"
              />
            </div>
          )}
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Guardar
          </button>
        </form>
      </main>
    </div>
  );
}
