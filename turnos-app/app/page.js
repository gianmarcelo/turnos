import { redirect } from 'next/navigation';

export default function Home() {
  // Redirigir automáticamente a la página de inicio de sesión
  redirect('/auth/signin');
  return null;
}