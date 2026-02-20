/**
 * DD.MM.YYYY veya DD.MM.YYYY HH:mm formatındaki tarih string'ini Date'e çevirir.
 * ISO string veya timestamp de kabul eder.
 */
export function parseTRDate(dateStr: string | undefined | null): Date | null {
  if (dateStr == null || dateStr === "") return null;
  const s = String(dateStr).trim();
  // DD.MM.YYYY veya DD.MM.YYYY HH:mm
  const match = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (match) {
    const [, d, m, y, h, min] = match;
    const day = parseInt(d!, 10);
    const month = parseInt(m!, 10) - 1;
    const year = parseInt(y!, 10);
    const hour = h != null ? parseInt(h, 10) : 0;
    const minute = min != null ? parseInt(min, 10) : 0;
    const date = new Date(year, month, day, hour, minute);
    if (!isNaN(date.getTime())) return date;
  }
  const iso = new Date(s);
  return isNaN(iso.getTime()) ? null : iso;
}

/**
 * Tarihi Türkçe kısa tarih formatında formatlar (gg.aa.yyyy).
 * DD.MM.YYYY string'ini olduğu gibi döndürebilir veya Date'e çevirip formatlar.
 */
export function formatTRDate(dateStr: string | undefined | null): string {
  const date = parseTRDate(dateStr);
  if (!date) return "—";
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Saat değerini Türkçe metin olarak döndürür: "X saat" (undefined/NaN için "0 saat").
 */
export function formatTRHours(hours: number | undefined | null): string {
  const n = Number(hours);
  if (Number.isNaN(n) || n < 0) return "0 saat";
  const fixed = n % 1 === 0 ? n : Math.round(n * 10) / 10;
  return `${fixed} saat`;
}
