'use client'; // Esto indica que es un componente cliente

import { signOut } from 'next-auth/react';

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

export default function LogoutButton() {
  return (
    <button
      onClick={handleLogout}
      className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
    >
      <img src="/images/logout-icon.png" alt="Cerrar sesión" className="w-6 h-6 mr-2" />
      Cerrar Sesión
    </button>
  );
}
