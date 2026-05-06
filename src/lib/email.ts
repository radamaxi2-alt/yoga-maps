/**
 * Yoga Maps — Email Service
 */

export async function sendReservationEmail({
  teacherEmail,
  teacherName,
  studentName,
  healthInfo,
  classTitle,
  classTime,
  status = "confirmed"
}: {
  teacherEmail: string;
  teacherName: string;
  studentName: string;
  healthInfo: string | null;
  classTitle: string;
  classTime: string;
  status?: "pending" | "confirmed";
}) {
  console.log(`[Email Simulation] Enviando mail a ${teacherEmail}...`);
  
  const isPending = status === "pending";
  const subject = isPending 
    ? `🧘 ¡Nueva Reserva Pendiente en Yoga Maps!` 
    : `✨ ¡Reserva Confirmada: ${studentName} se unió a ${classTitle}!`;

  const body = `
    Hola ${teacherName},
    
    Tienes una nueva reserva de ${studentName} para la clase "${classTitle}" (${classTime}).
    
    ${isPending ? 
      `EL ALUMNO HA SIDO REDIRIGIDO A WHATSAPP PARA CONCRETAR EL PAGO. 
      Recuerda entrar a tu Panel de Calendario para marcarla como "Confirmada" una vez que recibas el comprobante.` 
      : `La reserva ya está confirmada.`
    }
    
    📋 Ficha Médica/Salud del Alumno:
    ${healthInfo || "El alumno no proporcionó información de salud específica."}
    
    Recuerda que puedes gestionar todas tus clases desde tu Panel de Yoga Maps.
    
    Namasté,
    El equipo de Yoga Maps
  `;

  // Simulación de envío
  console.log("Subject:", subject);
  console.log("Body:", body);

  return { success: true };
}
