"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';

const handleLogout = () => {
    signOut({ callbackUrl: '/auth/signin' });
};

const Pagos = () => {
    const [planDetails, setPlanDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [referenceCode, setReferenceCode] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlanDetails = async () => {
            try {
                const response = await fetch('/api/clientes/obtener-plan');
                const data = await response.json();

                if (data.referencia === null) {
                    setReferenceCode(data.referenceCode);
                } else {
                    setReferenceCode(data.referencia.referenceCode);
                }

                setPlanDetails(data);
                setLoading(false);
            } catch (error) {
                setError('Error al cargar los detalles del plan.');
                setLoading(false);
            }
        };

        fetchPlanDetails();
    }, []);

    const handlePayment = async () => {
        setError(null); // Reset any previous errors
        try {
            const response = await fetch('/api/pagos/payU', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    total: planDetails?.valor,
                    buyerEmail: planDetails?.email,
                    referenceCode: referenceCode,
                    description: planDetails?.description
                })
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
            setError('Error en el servidor al intentar procesar el pago.');
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
                    <li className="mb-4"><Link href="/dashboard/contactanos">Contáctanos</Link></li>
                    <li className="mt-8">
                        <button onClick={handleLogout} className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                            <img src="/images/logout-icon.png" alt="Cerrar sesión" className="w-6 h-6 mr-2" />
                            Cerrar Sesión
                        </button>
                    </li>
                </ul>
            </nav>

            <div className="flex-1 p-8">
                <h1 className="text-2xl font-bold mb-6">Realizar Pago Mensual</h1>

                {loading ? (
                    <p>Cargando pagos pendientes...</p>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : planDetails.referencia ? (
                    <p>No hay pagos pendientes para este mes. Ya se ha realizado el pago.</p>
                ) : (
                    <>
                        <p>Tipo de plan: {planDetails?.tipoplan}</p>
                        <p>Valor a pagar: ${planDetails?.valor} COP</p>
                        <p>Descripción del pago: {planDetails?.description}</p>
                        <button
                            onClick={handlePayment}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                        >
                            Pagar ahora
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Pagos;
