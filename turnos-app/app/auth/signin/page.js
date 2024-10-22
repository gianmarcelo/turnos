"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loginMethod, setLoginMethod] = useState('email'); // Email, SMS, WhatsApp
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (loginMethod === 'email') {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
  
      if (result && !result.error) {
        router.push('/dashboard');
      } else {
        alert('Autenticación fallida');
      }
    } else if (loginMethod === 'sms' || loginMethod === 'whatsapp') {
      // Verificar número móvil antes de enviar OTP
      const verifyResponse = await fetch(`/api/auth/verify-client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber }),
      });
  
      const verifyResult = await verifyResponse.json();
      if (!verifyResult.exists) {
        alert('Cliente no válido o no existe, por favor ingrese el número móvil de su registro.');
        return;
      }
  
      // Verificar OTP
      const otpResponse = await fetch(`/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, otp }),
      });
  
      const otpResult = await otpResponse.json();
      if (otpResult.success) {
        // Iniciar sesión después de verificar el OTP
        const result = await signIn('credentials', {
          redirect: false,
          mobileNumber,
          otp,
        });
  
        if (result && !result.error) {
          router.push('/dashboard');
        } else {
          alert('Autenticación fallida al iniciar sesión después de verificar el OTP');
        }
      } else {
        alert('Error en la verificación del código');
      }
    }
  };
  

  const requestOtp = async () => {
    // Verificar número móvil antes de solicitar OTP
    const verifyResponse = await fetch(`/api/auth/verify-client`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber }),
    });

    if (!verifyResponse.ok) {
      alert('Error en la verificación, número móvil no registrado.');
      return;
    }

    const verifyResult = await verifyResponse.json();
    if (!verifyResult.exists) {
      alert('Cliente no válido o no existe.');
      return;
    }

    // Solicitar OTP
    const response = await fetch(`/api/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber, loginMethod: 'sms' }),
    });

    const result = await response.json();
    if (result.success) {
      alert('Código OTP enviado');
    } else {
      alert('Error al enviar el código OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-center mb-6">Bienvenido a MiTurno</h1>
        <h2 className="text-2xl font-bold mb-4">Iniciar sesión</h2>

        <div className="mb-4 flex justify-center">
          <button
            onClick={() => setLoginMethod('email')}
            className={`mr-2 px-4 py-2 rounded-lg ${loginMethod === 'email' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Acceso por Email
          </button>
          <button
            onClick={() => setLoginMethod('sms')}
            className={`mr-2 px-4 py-2 rounded-lg ${loginMethod === 'sms' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Acceso por SMS
          </button>
          <button
            onClick={() => setLoginMethod('whatsapp')}
            className={`px-4 py-2 rounded-lg ${loginMethod === 'whatsapp' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Acceso por WhatsApp
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {loginMethod === 'email' && (
            <>
              <input
                type="email"
                placeholder="Correo eléctronico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 w-full mb-4"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 w-full mb-4"
              />
            </>
          )}

          {loginMethod === 'sms' && (
            <>
              <input
                type="text"
                placeholder="Número móvil (con 57)"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="border p-2 w-full mb-4"
                required="true"
              />
              <button
                type="button"
                onClick={requestOtp}
                className="bg-green-500 text-white px-4 py-2 rounded-lg"
              >
                Solicitar Código OTP
              </button>
              <input
                type="text"
                placeholder="Ingrese el código OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="border p-2 w-full mb-4"
                required="true"
              />
            </>
          )}

          {loginMethod === 'whatsapp' && (
            <>
              <input
                type="text"
                placeholder="Número móvil (con 57)"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="border p-2 w-full mb-4"
                required="true"
              />
              <div className="flex justify-center mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://wa.me/15550910552?text=Solicitud%20de%20código%20OTP`}
                  alt="QR para WhatsApp"
                  className="w-32 h-32"
                />
              </div>
              <p className="text-center text-gray-600">
                Escanee el código QR para enviar mensaje con WhatsApp con la solicitud de OTP.
              </p>
              <input
                type="text"
                placeholder="Ingrese el código OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="border p-2 w-full mb-4"
                required="true"
              />
            </>
          )}

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
