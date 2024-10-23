'use client'

import Link from 'next/link';
import 'tailwindcss/tailwind.css';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';

const handleLogout = () => {
  signOut({ callbackUrl: '/auth/signin' }); // Redirigir al usuario a la página de inicio de sesión
};

const Contactanos = () => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación simple de los campos
    if (!email || !subject || !message) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, introduce un correo válido.');
      return;
    }

    if (message.length > 500) {
      setError('El mensaje no puede superar los 500 caracteres.');
      return;
    }

    try {
      const res = await fetch('/api/contactanos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, subject, message }),
      });

      const result = await res.json();

      if (res.ok) {
        setSuccess('Mensaje enviado con éxito.');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setError(result.error || 'Ocurrió un error al enviar el mensaje.');
      }
    } catch (error) {
      setError('Ocurrió un error. Inténtalo de nuevo más tarde.');
    }
  };

  return (
    <div className="flex">
      {/* Panel lateral de navegación */}
      <nav className="w-64 bg-gray-800 text-white min-h-screen p-4">
        <ul>
          <li className="mb-4"><Link href="/dashboard">Inicio</Link></li>
          <li className="mb-4"><Link href="/dashboard/estadisticas">Estadísticas</Link></li>
          <li className="mb-4"><Link href="/dashboard/configuracion">Configuración</Link></li>
          <li className="mb-4"><Link href="/dashboard/estado-cuenta">Seguridad y Compras</Link></li>
          <li className="mb-4"><Link href="/dashboard/historial">Historial de transacciones</Link></li>
          <li className="mb-4"><Link href="/dashboard/pagos">Pagos</Link></li>
          <li className="mb-4"><Link href="/dashboard/contactanos">Contáctanos</Link></li>
          <li className="mt-8">
            <button onClick={handleLogout} className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              <Image src="/images/logout-icon.png" alt="Cerrar sesión" width={24} height={24} className="mr-2" />
              Cerrar Sesión
            </button>
          </li>
        </ul>
      </nav>

      {/* Contenido principal */}
      <main className="flex-1 p-8 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6">Contáctanos</h1>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-8 shadow-md rounded-lg">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}

          <div className="mb-6">
            <label htmlFor="email" className="block text-lg font-semibold mb-2">Correo electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingresa tu correo"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="subject" className="block text-lg font-semibold mb-2">Asunto</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={150}
              placeholder="Ingresa el asunto"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="message" className="block text-lg font-semibold mb-2">Mensaje</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={500}
              rows={8}
              placeholder="Escribe tu mensaje (máximo 500 caracteres)"
              required
            />
          </div>

          <button type="submit" className="bg-blue-500 text-white px-6 py-3 rounded font-bold hover:bg-blue-600">
            Enviar Mensaje
          </button>
        </form>

        {/* Sección de redes sociales */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Síguenos en nuestras redes sociales</h2>
          <div className="flex justify-center space-x-8">
            <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <Image src="/icons/facebook.png" alt="Facebook" width={48} height={48} />
            </Link>
            <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <Image src="/icons/instagram.png" alt="Instagram" width={48} height={48} />
            </Link>
            <Link href="https://wa.me/123456789" target="_blank" rel="noopener noreferrer">
              <Image src="/icons/whatsapp.png" alt="WhatsApp" width={48} height={48} />
            </Link>
            <Link href="mailto:info@miturno.com" target="_blank" rel="noopener noreferrer">
              <Image src="/icons/email.png" alt="Email" width={48} height={48} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contactanos;
