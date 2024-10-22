import { enviarMensajePorSMS, enviarMensajePorWhatsApp } from '../utils/mensajesServicios';

export async function enviarMensaje(numeroMovil, mensaje, tipo) {
  try {
    if (tipo === 'sms') {
      const resultado = await enviarMensajePorSMS(numeroMovil, mensaje);
      return resultado && resultado.active; // Cambia esto según la estructura de la respuesta
    } else {
      const resultado = await enviarMensajePorWhatsApp(numeroMovil, mensaje);
      return resultado && resultado.success; // Cambia esto según la estructura de la respuesta
    }
  } catch (error) {
    console.error(`Error al enviar el mensaje por ${tipo}:`, error);
    return false; // Retornar false si hay un error
  }
}
