/**
 * Yoga Maps — Email Service
 * 
 * Este servicio maneja el envío de notificaciones por correo electrónico.
 * Para producción, se recomienda usar Resend, SendGrid o similar.
 */

export async function sendReservationEmail({
  teacherEmail,
  teacherName,
  studentName,
  healthInfo,
  classTitle,
  classTime,
}: {
  teacherEmail: string;
  teacherName: string;
  studentName: string;
  healthInfo: string | null;
  classTitle: string;
  classTime: string;
}) {
  console.log(`[Email Simulation] Enviando mail a ${teacherEmail}...`);
  
  const subject = `Nueva reserva: ${studentName} se unió a ${classTitle}`;
  const body = `
    Hola ${teacherName},
    
    Tienes una nueva reserva para tu clase "${classTitle}" a las ${classTime} hs.
    
    Alumno: ${studentName}
    
    📋 Ficha Médica/Salud:
    ${healthInfo || "El alumno no proporcionó información de salud específica."}
    
    Recuerda revisar tu panel para ver la lista completa de alumnos.
    
    Namasté,
    El equipo de Yoga Maps
  `;

  // Aquí iría la integración real con Resend:
  /*
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Yoga Maps <notificaciones@tu-dominio.com>',
      to: [teacherEmail],
      subject,
      text: body,
    }),
  });
  */

  return { success: true };
}
