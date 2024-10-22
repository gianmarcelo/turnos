"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

const handleLogout = async () => {
  try {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if (response.ok) {
      signOut({ callbackUrl: '/auth/signin' });
    } else {
      console.error('Error al cerrar sesión:', await response.json());
    }
  } catch (error) {
    console.error('Error al cerrar la sesión:', error);
  }
};

const convertTransactionState = (state) => {
  const stateMap = {
    4: 'APROBADA',
    5: 'EXPIRADA',
    6: 'RECHAZADA',
    7: 'PENDIENTE',
    104: 'ERROR'
  };
  return stateMap[state] || 'DESCONOCIDO';
};

export default function HistorialTransacciones() {
    const { data: session, status } = useSession();
    const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
    const [filtroFechaFin, setFiltroFechaFin] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [transacciones, setTransacciones] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      const cargarTransacciones = async () => {
        if (filtroFechaInicio && filtroFechaFin) {
          setLoading(true);
          setError(null);
          try {
            // Convertir las fechas a formato ISO 8601
            const fechaInicioISO = new Date(filtroFechaInicio + 'T00:00:00Z').toISOString();
            const fechaFinISO = new Date(filtroFechaFin + 'T23:59:59.999Z').toISOString();
  
            const response = await fetch(`/api/pagos/historial?fechaInicio=${fechaInicioISO}&fechaFin=${fechaFinISO}`);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Datos recibidos:', data);
            setTransacciones(data);
          } catch (error) {
            console.error('Error al cargar transacciones:', error);
            setError('Error al cargar transacciones. Por favor, intente de nuevo.');
          } finally {
            setLoading(false);
          }
        }
      };
      
      cargarTransacciones();
    }, [filtroFechaInicio, filtroFechaFin]);
  
    const filtrarTransacciones = transacciones.filter((transaccion) => {
      const fechaTransaccion = transaccion.fechatransaccion;
      const coincideFecha = fechaTransaccion >= filtroFechaInicio + 'T00:00:00Z' && fechaTransaccion <= filtroFechaFin + 'T23:59:59.999Z';
      const coincideEstado = filtroEstado ? convertTransactionState(transaccion.estadotransaccion) === filtroEstado : true;
      return coincideFecha && coincideEstado;
    });
  
    const formatearFecha = (fechaISO) => {
      // Crear la fecha en UTC
      const fecha = new Date(fechaISO);
      // Ajustar a la zona horaria local
      const fechaLocal = new Date(fecha.getTime() + fecha.getTimezoneOffset() * 60000);
      return fechaLocal.toLocaleString('es-ES', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };

    const formattedAmount = (Amount) => { 
        const copAmount = parseFloat(Amount).toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
        });
        return copAmount
    };
  
    if (status === "loading") {
      return <div>Cargando...</div>;
    }
  
    if (status === "unauthenticated") {
      return <div>Acceso denegado. Por favor, inicie sesión.</div>;
    }
  
    return (
      <div className="flex">
        {/* Panel Lateral */}
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
  
        {/* Contenido Principal */}
        <main className="flex-1 p-8 bg-gray-100">
          <h1 className="text-3xl font-bold mb-6">Historial de Transacciones</h1>
  
          {/* Filtros */}
          <div className="mb-8 bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Filtrar Transacciones</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold">Fecha Inicio:</label>
                <input
                  type="date"
                  value={filtroFechaInicio}
                  onChange={(e) => setFiltroFechaInicio(e.target.value)}
                  className="border p-2 w-full rounded"
                />
              </div>
              <div>
                <label className="block font-semibold">Fecha Fin:</label>
                <input
                  type="date"
                  value={filtroFechaFin}
                  onChange={(e) => setFiltroFechaFin(e.target.value)}
                  className="border p-2 w-full rounded"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block font-semibold">Estado de la Transacción:</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="border p-2 w-full rounded"
              >
                <option value="">Todos los Estados</option>
                <option value="APROBADA">Aprobada</option>
                <option value="EXPIRADA">Expirada</option>
                <option value="RECHAZADA">Rechazada</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="ERROR">Error</option>
              </select>
            </div>
          </div>
  
          {/* Tabla de Transacciones */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Resultados</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {loading ? (
              <p>Cargando transacciones...</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Estado Transacción</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtrarTransacciones.length > 0 ? (
                    filtrarTransacciones.map((transaccion, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">{formatearFecha(transaccion.fechatransaccion)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{convertTransactionState(transaccion.estadotransaccion)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{transaccion.descripcion}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{formattedAmount(transaccion.total)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-gray-500">No se encontraron transacciones.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    );
  }
  