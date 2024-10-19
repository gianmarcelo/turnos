"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

const handleLogout = async () => {
    try {
      // Llamada a la API para cerrar el pool de conexiones
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      
      if (response.ok) {
        // Cierra la sesión
        signOut({ callbackUrl: '/auth/signin' });
      } else {
        console.error('Error al cerrar la sesión:', await response.json());
      }
    } catch (error) {
      console.error('Error al cerrar las conexiones del pool:', error);
    }
  };

export default function ResultadoTransaccion() {
  const searchParams = useSearchParams();
  const estado = searchParams.get('estado');
  const referencia = searchParams.get('referencia');
  const monto = searchParams.get('monto');
  const transaccion = searchParams.get('transaccion');
  const metodoPago = searchParams.get('metodoPago');
  const fechaPago = searchParams.get('fechaPago');

  const [mensajeResultado, setMensajeResultado] = useState('');

  useEffect(() => {
    if (estado === '4') {
      setMensajeResultado('¡Tu pago fue exitoso!');
    } else if (estado === '6') {
      setMensajeResultado('Tu pago fue rechazado.');
    } else if (estado === '104') {
      setMensajeResultado('Tu pago presentó error.');
    } else if (estado === '7') {
      setMensajeResultado('Tu pago está pendiente.');
    } else {
      setMensajeResultado('Tu pago no pudo ser procesado.');
    }
  }, [estado]);

  return (
    <div className="flex">
      <nav className="w-64 bg-gray-800 text-white min-h-screen p-4">
        <ul>
          <li className="mb-4"><Link href="/dashboard">Inicio</Link></li>
          <li className="mb-4"><Link href="/dashboard/estadisticas">Estadísticas</Link></li>
          <li className="mb-4"><Link href="/dashboard/configuracion">Configuración</Link></li>
          <li className="mb-4"><Link href="/dashboard/estado-cuenta">Seguridad y Compras</Link></li>
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
        <h1 className="text-2xl font-bold mb-6">Resultado de la Transacción</h1>
        <div className="mb-4">
          <p className="text-xl">{mensajeResultado}</p>
          <ul className="mt-4">
          <li><strong>Fecha de Transacción:</strong> {fechaPago}</li>
            <li><strong>Referencia:</strong> {referencia}</li>
            <li><strong>Monto:</strong> {monto}</li>
            <li><strong>ID Transacción:</strong> {transaccion}</li>
            <li><strong>Método de Pago:</strong> {metodoPago}</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
