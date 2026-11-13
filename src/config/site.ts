/**
 * CONFIGURACIÓN CENTRAL: agrega aquí las cuentas OFICIALES de la empresa.
 * Dejar un valor vacío desactiva ese enlace para no enviar visitantes
 * a perfiles equivocados ni inventar datos de contacto.
 */
export const company = {
  name: 'Ay! Mariachi Para Todos',
  city: 'Guadalajara, Jalisco',
  whatsappNumber: '523348265069',
  instagram: 'https://www.instagram.com/aymariachiparatodos/',
  facebook: 'https://www.facebook.com/profile.php?id=61595880183603',
  tiktok: 'https://www.tiktok.com/@aymariachiparatodos',
  email: 'aymariachiparatodos@gmail.com',
} as const;

export function buildWhatsAppUrl(number: string, message: string) {
  const digits = number.replace(/\D/g, '');
  if (!digits) return '';
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function whatsAppUrl() {
  return buildWhatsAppUrl(company.whatsappNumber, '¡Hola! Me gustaría conocer las opciones de mariachi para mi evento.');
}
