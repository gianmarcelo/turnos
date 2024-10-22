"use client";
import Link from 'next/link';
import { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";
import "tailwindcss/tailwind.css";
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Importar el plugin
import { Chart } from 'chart.js';
import { signOut } from 'next-auth/react';

const handleLogout = () => {
  signOut({ callbackUrl: '/auth/signin' }); // Redirigir al usuario a la página de inicio de sesión
};

Chart.register(ChartDataLabels); // Registrar el plugin en Chart.js

export default function Estadisticas() {
  const [mensajesPorDia, setMensajesPorDia] = useState([]);
  const [mensajesPorMes, setMensajesPorMes] = useState([]);
  const [mensajesPorAno, setMensajesPorAno] = useState([]);
  const [horasPico, setHorasPico] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/estadisticas");
      const data = await response.json();

      setMensajesPorDia(data.mensajesPorDia);
      setMensajesPorMes(data.mensajesPorMes);
      setMensajesPorAno(data.mensajesPorAno);
      setHorasPico(data.horasPico);
    };

    fetchData();
  }, []);

  // Preparar datos para el gráfico de mensajes por día
  const dataMensajesPorDia = {
    labels: mensajesPorDia.map((item) => item.day),
    datasets: [
      {
        label: "Pedidos por Día",
        data: mensajesPorDia.map((item) => item.total_messages),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 1,
      },
    ],
  };

  // Preparar datos para el gráfico de mensajes por mes
  const dataMensajesPorMes = {
    labels: mensajesPorMes.map((item) => item.month.slice(0, 7)), // Solo mostrar año y mes
    datasets: [
      {
        label: "Pedidos por Mes",
        data: mensajesPorMes.map((item) => item.total_messages),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderWidth: 1,
      },
    ],
  };

  // Preparar datos para el gráfico de mensajes por año
  const dataMensajesPorAno = {
    labels: mensajesPorAno.map((item) => item.year),
    datasets: [
      {
        label: "Pedidos por Año",
        data: mensajesPorAno.map((item) => item.total_messages),
        borderColor: "rgba(255, 206, 86, 1)",
        backgroundColor: "rgba(255, 206, 86, 0.2)",
        borderWidth: 1,
      },
    ],
  };

  // Preparar datos para el gráfico de horas pico
  const dataHorasPico = {
    labels: horasPico.map((item) => `${item.hour}:00`), // Mostrar la hora con formato de 24h
    datasets: [
      {
        label: "Pedidos por Hora",
        data: horasPico.map((item) => item.total_messages),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderWidth: 1,
      },
    ],
  };

  // Opciones generales para mostrar los valores en los gráficos
  const options = {
    plugins: {
      datalabels: {
        display: true,
        color: 'black',
        anchor: 'end',
        align: 'top',
        formatter: (value) => value, // Mostrar el valor numérico en cada punto
      },
    },
  };

  return (
    <div className="flex">
      {/* Panel lateral */}
      <nav className="w-64 bg-gray-800 text-white min-h-screen p-4">
        <ul>
          <li className="mb-4"><Link href="/dashboard">Inicio</Link></li>
          <li className="mb-4"><a href="/dashboard/estadisticas">Estadísticas</a></li>
          <li className="mb-4"><a href="/dashboard/configuracion">Configuración</a></li>
          <li className="mb-4"><a href="/dashboard/estado-cuenta">Seguridad y Compras</a></li>
          <li className="mb-4"><Link href="/dashboard/historial">Historial de transacciones</Link></li>
          <li className="mb-4"><Link href="/dashboard/pagos">Pagos</Link></li>
          <li className="mb-4"><a href="/dashboard/acerca">Acerca de</a></li>
          <li className="mt-8">
            <button onClick={handleLogout} className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            <img src="/images/logout-icon.png" alt="Cerrar sesión" className="w-6 h-6 mr-2" />
            Cerrar Sesión
            </button>
          </li>
        </ul>
      </nav>
      {/* Contenido principal */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Estadísticas</h1>

        {/* Gráfico de mensajes por día */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Pedidos por Día</h2>
          <Bar data={dataMensajesPorDia} options={options} />
        </div>

        {/* Gráfico de mensajes por mes */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Pedidos por Mes</h2>
          <Bar data={dataMensajesPorMes} options={options} />
        </div>

        {/* Gráfico de mensajes por año */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Pedidos por Año</h2>
          <Bar data={dataMensajesPorAno} options={options} />
        </div>

        {/* Gráfico de horas pico */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Promedio pedidos por Hora (Horas Pico)</h2>
          <Bar data={dataHorasPico} options={options} />
        </div>
      </main>
    </div>
  );
}
