// Centralized WhatsApp deep-link + message templates — every part of the app that opens
// WhatsApp goes through here, so copy stays consistent and lives in exactly one place.

export const whatsappTemplates = {
  clinicConsult: (p: { pet?: string }) =>
    `Olá! Gostaria de agendar uma *consulta veterinária*${p.pet ? ` para o(a) ${p.pet}` : ''}. ` +
    `Poderiam me informar os horários disponíveis?`,

  /** Built from the service card the visitor selected, and the day they picked on the calendar. */
  clinicService: (p: { service: string; date?: string; slots?: string[] }) => {
    const lines = [`Olá! Gostaria de agendar *${p.service}* para o meu pet. 🐾`];
    if (p.date) {
      lines.push('', `📅 Data pretendida: *${p.date}*`);
      if (p.slots?.length) {
        lines.push(`🕐 Horários que vi disponíveis: ${p.slots.slice(0, 4).join(', ')}`);
      }
    }
    lines.push('', 'Podem confirmar a disponibilidade?');
    return lines.join('\n');
  },

  hotelStay: (p: { checkIn?: string; checkOut?: string }) => {
    const lines = ['Olá! Gostaria de reservar uma *hospedagem* para o meu pet. 🏡🐾'];
    if (p.checkIn) {
      lines.push('', `📅 Entrada: *${p.checkIn}*`);
      if (p.checkOut) lines.push(`📅 Saída: *${p.checkOut}*`);
    }
    lines.push('', 'Podem me passar os valores e a disponibilidade?');
    return lines.join('\n');
  },

  productInquiry: (p: { productName: string }) =>
    `Olá! Tenho interesse no produto *${p.productName}*. Poderiam me passar mais informações?`,

  bookingConfirm: (p: { tutor: string; pet: string; date: string; time: string }) =>
    `Olá, ${p.tutor}! 🐾\n\nEstamos *confirmando* o banho e tosa do(a) *${p.pet}*:\n` +
    `📅 ${p.date}\n🕐 ${p.time}\n\nPodemos confirmar?`,

  bookingReschedule: (p: { tutor: string; pet: string; date: string; time: string }) =>
    `Olá, ${p.tutor}! Precisamos *reagendar* o horário do(a) *${p.pet}*. ` +
    `A nova sugestão é ${p.date} às ${p.time}. Fica bom para você?`,

  bookingCancel: (p: { tutor: string; pet: string; date: string }) =>
    `Olá, ${p.tutor}. Infelizmente precisamos *cancelar* o agendamento do(a) *${p.pet}* em ${p.date}. ` +
    `Podemos remarcar?`,

  bookingDone: (p: { tutor: string; pet: string }) =>
    `Olá, ${p.tutor}! O(A) *${p.pet}* está pronto(a) e cheiroso(a)! 🛁✨ Pode vir buscar.`,

  general: () => `Olá! Gostaria de falar com o Pet Studio.`,
} as const;

export function buildWhatsappUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
