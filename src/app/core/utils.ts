export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const pad = (n: number) => String(n).padStart(2, '0');
export const isoOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
export const rupee = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

export function mdY(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}
export function longD(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
}
const utc = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d); };
export function addDays(iso: string, n: number): string {
  const d = new Date(utc(iso) + n * 864e5);
  return isoOf(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}
