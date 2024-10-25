"use client";
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn , getCsrfToken} from 'next-auth/react';
import { toast } from 'react-toastify';



// Constantes
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  max: 5,
};

const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 3;

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Componente para el temporizador
const OTPTimer = ({ remainingTime }) => {
  if (remainingTime <= 0) return null;
  
  return (
    <div className="text-sm text-gray-600 mt-2">
      Código expira en: {formatTime(remainingTime)}
    </div>
  );
};


// Validadores
const validators = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  mobileNumber: (number) => /^57\d{10}$/.test(number),
  otp: (otp) => /^\d{6}$/.test(otp),
};

// Custom Hook para autenticación
const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  const makeSecureRequest = async (url, data) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': await getCsrfToken(),
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Request error:', error);
      throw new Error('Error en la petición');
    }
  };

  return {
    isLoading,
    error,
    otpAttempts,
    isBlocked,
    makeSecureRequest,
    setIsLoading,
    setError,
    setOtpAttempts,
  };
};

export default function SignIn() {
  // Estados
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mobileNumber: '',
    otp: '',
  });
  const [loginMethod, setLoginMethod] = useState('email');
  const [otpSent, setOtpSent] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  
  const {
    isLoading,
    error,
    otpAttempts,
    isBlocked,
    makeSecureRequest,
    setIsLoading,
    setError,
    setOtpAttempts,
  } = useAuth();

  const router = useRouter();

  // Efectos
  useEffect(() => {
    let timer;
    if (remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            // Cuando el tiempo expira
            toast.warning('El código OTP ha expirado. Por favor, solicite uno nuevo.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [remainingTime]);  

  // Manejadores
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  }, []);

  const validateForm = () => {
    const { email, password, mobileNumber, otp } = formData;
    
    if (loginMethod === 'email') {
      if (!validators.email(email)) {
        toast.error('Email inválido');
        return false;
      }
      if (!password || password.length < 6) {
        toast.error('Contraseña debe tener al menos 6 caracteres');
        return false;
      }
    } else {
      if (!validators.mobileNumber(mobileNumber)) {
        toast.error('Número móvil inválido');
        return false;
      }
      if (otpSent && !validators.otp(otp)) {
        toast.error('Código OTP inválido');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (isBlocked) {
      toast.error('Cuenta bloqueada temporalmente');
      return;
    }
  
    setIsLoading(true);
    try {
      if (loginMethod === 'email') {
        const result = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });
  
        if (result?.error) {
          throw new Error(result.error);
        }
  
        // Redirige solo si hay éxito
        router.push('/dashboard'); 
      } else {
        // Lógica para SMS/WhatsApp
        const otpVerification = await makeSecureRequest('/api/auth/verify-otp', {
          mobileNumber: formData.mobileNumber,
          otp: formData.otp,
        });
  
        if (otpVerification.success) {
          toast.success('Verificación OTP exitosa');
          router.push('/dashboard'); 
        } else {
          // Manejo de intentos fallidos
          setOtpAttempts((prev) => {
            const newAttempts = prev + 1;
            if (newAttempts >= MAX_OTP_ATTEMPTS) {
              setIsBlocked(true);
              setTimeout(() => setIsBlocked(false), RATE_LIMIT.windowMs);
            }
            return newAttempts;
          });
          throw new Error('Verificación OTP fallida');
        }
      }
    } catch (error) {
      toast.error(error.message); // Muestra el error en la UI
      setError(error.message);
    } finally {
      setIsLoading(false); // Asegúrate de que este se ejecute en todos los casos
    }
  };
    

  const requestOtp = async () => {
    if (!validators.mobileNumber(formData.mobileNumber)) {
      toast.error('Número móvil inválido');
      return;
    }
  
    setIsLoading(true);
    try {
      const result = await makeSecureRequest('/api/auth/request-otp', {
        mobileNumber: formData.mobileNumber,
        loginMethod,
        expirationTime: Date.now() + OTP_EXPIRATION_TIME // Añadir tiempo de expiración
      });
  
      if (result.success) {
        setOtpSent(true);
        setRemainingTime(OTP_EXPIRATION_TIME / 1000); // Convertir a segundos
        toast.success('Código OTP enviado');
      }
    } catch (error) {
      toast.error('Error al enviar OTP');
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };  

  // JSX
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

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
                name="email" 
                placeholder="Correo electrónico"
                value={formData.email} 
                onChange={handleInputChange}
                className="border p-2 w-full mb-4"
              />
              <input
                type="password"
                name="password" 
                placeholder="Contraseña"
                value={formData.password} 
                onChange={handleInputChange} 
                className="border p-2 w-full mb-4"
              />
            </>
          )}

          {loginMethod === 'sms' && (
            <>
              <input
                type="text"
                name="mobileNumber"
                placeholder="Número móvil (con 57)"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                className="border p-2 w-full mb-4"
                required
              />
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={requestOtp}
                  disabled={remainingTime > 0} // Deshabilitar mientras hay tiempo restante
                  className={`w-full px-4 py-2 rounded-lg ${
                    remainingTime > 0 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                >
                  {remainingTime > 0 
                    ? `Espere ${formatTime(remainingTime)} para reenviar` 
                    : 'Solicitar Código OTP'}
                </button>
                {otpSent && <OTPTimer remainingTime={remainingTime} />}
              </div>
              {otpSent && (
                <input
                  type="text"
                  name="otp"
                  placeholder="Ingrese el código OTP"
                  value={formData.otp}
                  onChange={handleInputChange}
                  className="border p-2 w-full mb-4 mt-4"
                  required
                />
              )}
            </>
          )}

          {loginMethod === 'whatsapp' && (
            <>
              <input
                type="text"
                name="mobileNumber" 
                placeholder="Número móvil (con 57)"
                value={formData.mobileNumber} 
                onChange={handleInputChange} 
                className="border p-2 w-full mb-4"
                required
              />
              <div className="flex justify-center mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://wa.me/15550910552?text=Solicitud%20de%20código%20OTP`}
                  alt="QR para WhatsApp"
                  className="w-32 h-32"
                />
              </div>
              <p className="text-center text-gray-600">
                Escanee el código QR para enviar mensaje de WhatsApp con la solicitud de OTP.
              </p>
              <input
                type="text"
                name="otp" // Añadir el atributo name
                placeholder="Ingrese el código OTP"
                value={formData.otp} // Usar formData.otp
                onChange={handleInputChange} // Usar handleInputChange
                className="border p-2 w-full mb-4"
                required
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
