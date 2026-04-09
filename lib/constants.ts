export const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export const MOODS = [
  "😊 En paz",
  "🙏 Agradecida",
  "💪 Motivada",
  "😌 Reflexiva",
  "🌱 Creciendo",
  "💭 Pensativa",
];

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayKey(): string {
  return dateKey(new Date());
}

export function parseDateKey(dk: string): Date {
  const [y, m, d] = dk.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateLong(dk: string): string {
  const d = parseDateKey(dk);
  return `${d.getDate()} de ${MONTHS_ES[d.getMonth()]}, ${d.getFullYear()}`;
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}
