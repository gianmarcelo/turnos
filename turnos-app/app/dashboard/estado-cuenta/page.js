"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import 'tailwindcss/tailwind.css';

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

export default function EstadoCuenta() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [passwordAnterior, setPasswordAnterior] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [planActual, setPlanActual] = useState('Básico');
  const [nuevoPlan, setNuevoPlan] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [planesDisponibles, setPlanesDisponibles] = useState([]);
  const [creditosOpciones, setCreditosOpciones] = useState([]); // Aquí inicializamos el estado
  const [tarifas, setTarifas] = useState({});
  const [total, setTotal] = useState(0);

  // Redirección si no autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Cargar tarifas y créditos desde el API
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const response = await fetch('/api/clientes/obtener-tarifas');
        const data = await response.json();

        if (response.ok) {
          const tarifasCargadas = {};
          const creditos = [];

          data.forEach((tarifa) => {
            if (['Plus', 'Pro', 'Básico'].includes(tarifa.item)) {
              tarifasCargadas[tarifa.item] = tarifa.valor;
            } else if (/^\d/.test(tarifa.item) || tarifa.item.includes('Créditos')) {
              creditos.push({
                cantidad: tarifa.creditos, 
                precio: tarifa.valor
              });
            }
          });

          setTarifas(tarifasCargadas);
          setCreditosOpciones(creditos); // Guardamos los créditos con su cantidad y precio
        } else {
          console.error('Error al cargar tarifas:', data.error);
        }
      } catch (error) {
        console.error('Error al realizar la petición:', error);
      }
    };

    cargarDatos();
  }, [])

  // Definir planes disponibles según el plan actual
  useEffect(() => {
    if (planActual === 'Básico') {
      setPlanesDisponibles(['Plus', 'Pro']);
    } else if (planActual === 'Plus') {
      setPlanesDisponibles(['Pro']);
    } else if (planActual === 'Pro') {
      setPlanesDisponibles([]);
    }
  }, [planActual]);

  // Calcular total del carrito
  useEffect(() => {
    const totalCarrito = carrito.reduce((acc, item) => acc + item.precio, 0);
    setTotal(totalCarrito);
  }, [carrito]);

  // Validación del nuevo password
  const validarNuevoPassword = () => {
    const regexPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    return regexPassword.test(nuevoPassword);
  };

  // Manejar el cambio de contraseña
  const handleChangePassword = async () => {
    if (!validarNuevoPassword()) {
      setMensajeError('La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.');
      return;
    }

    if (nuevoPassword !== confirmarPassword) {
      setMensajeError('Las contraseñas no coinciden.');
      return;
    }

    const response = await fetch("/api/clientes/actualizar-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ passwordAnterior, nuevoPassword })
    });

    const data = await response.json();

    if (data.error) {
      setMensajeError(data.error);
    } else {
      setMensajeError(data.message);
    }
  };

  // Manejar la selección de plan
  const handleSelectPlan = (plan) => {
    if (planesDisponibles.includes(plan)) {
      setNuevoPlan(plan);
      setCarrito([...carrito.filter(item => item.tipo !== 'plan'), { tipo: 'plan', nombre: plan, precio: tarifas[plan] }]);
    }
  };

  // Manejar la adición de créditos
  const handleAddCredits = (creditosSeleccionados) => {
    setCarrito([...carrito, { tipo: 'creditos', cantidad: creditosSeleccionados.cantidad, precio: creditosSeleccionados.precio }]);
  };

  // Manejar la eliminación de elementos del carrito
  const handleRemoveFromCart = (index) => {
    const nuevoCarrito = carrito.filter((_, i) => i !== index);
    setCarrito(nuevoCarrito);
  };

  // Manejar la sumisión del pago
  const handleSubmit = async () => {
    if (carrito.length === 0) {
      alert('Tu carrito está vacío. Agrega un plan o créditos antes de procesar el pago.');
      return;
    }

    const total = carrito.reduce((acc, item) => acc + item.precio, 0);

    try {
      const response = await fetch('/api/pagos/payU', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: carrito,
          total: total,
          buyerEmail: session?.user?.email || ''
        }),
      });

      if (!response.ok) {
        throw new Error('Error al procesar el pago');
      }

      const { formHtml } = await response.json();

      const formContainer = document.createElement('div');
      formContainer.innerHTML = formHtml;
      document.body.appendChild(formContainer);

      formContainer.querySelector('form').submit();

    } catch (error) {
      console.error('Error en la solicitud de pago:', error);
      alert('Hubo un problema procesando el pago. Por favor, intenta nuevamente.');
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
        <h1 className="text-2xl font-bold mb-6">Seguridad y Compras</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Actualizar Contraseña</h2>
          <input
            type="password"
            value={passwordAnterior}
            onChange={(e) => setPasswordAnterior(e.target.value)}
            placeholder="Contraseña Anterior"
            className="border p-2 w-full mb-2"
          />
          <input
            type="password"
            value={nuevoPassword}
            onChange={(e) => setNuevoPassword(e.target.value)}
            placeholder="Nueva Contraseña"
            className="border p-2 w-full mb-2"
          />
          <input
            type="password"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            placeholder="Confirmar Nueva Contraseña"
            className="border p-2 w-full mb-2"
          />
          {mensajeError && <p className="text-red-500">{mensajeError}</p>}
          <button onClick={handleChangePassword} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Actualizar Contraseña
          </button>
        </div>

        <div className="flex justify-between mb-8">

          {/* Seleccionar plan */}
          <div className="w-1/2 pr-4">
            <h2 className="text-xl font-semibold mb-4">Seleccionar Plan</h2>
            {planesDisponibles.length > 0 ? (
              <ul>
                {planesDisponibles.map((plan) => (
                  <li key={plan} className="mb-2">
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className="bg-green-500 text-white px-4 py-2 rounded w-full">
                      Comprar Plan {plan}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Ya tienes el plan más alto.</p>
            )}
          </div>

          {/* Comprar créditos */}
          <div className="w-1/2 pl-4">
          <h2 className="text-xl font-semibold mb-4">Comprar Créditos</h2>
          <ul>
            {creditosOpciones.map((opcion, index) => (
              <li key={index} className="mb-2">
                <button
                  onClick={() => handleAddCredits(opcion)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded w-full">
                  Comprar {opcion.cantidad} Créditos
                </button>
              </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Carrito de compras */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Carrito de Compras</h2>
          <ul>
            {carrito.map((item, index) => (
              <li key={index} className="flex justify-between mb-2">
                <div>
                  {item.tipo === 'plan' ? `Plan: ${item.nombre}` : `Créditos: ${item.cantidad}`}
                </div>
                <div>
                  Precio: ${item.precio}
                </div>
                <button
                  onClick={() => handleRemoveFromCart(index)}
                  className="bg-red-500 text-white px-2 py-1 rounded ml-4">
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
          <div className="text-right font-bold mt-4">
            Total: ${total}
          </div>
          <button
            onClick={handleSubmit}
            className="bg-red-500 text-white px-4 py-2 mt-4 rounded">
            Procesar Pago
          </button>
        </div>
      </main>
    </div>
  );
}
