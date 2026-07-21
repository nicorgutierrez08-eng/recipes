/** Human formatting helpers: fractions, times, titles. */

/**
 * Parse a user-typed amount into a number.
 * Accepts decimals ("1.5"), fractions ("3/4"), and mixed numbers ("1 1/2").
 * Returns NaN if it can't be parsed.
 */
export function parseAmount(input: string): number {
  const s = input.trim();
  if (!s) return NaN;
  const mixed = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) {
    const d = Number(mixed[3]);
    return d ? Number(mixed[1]) + Number(mixed[2]) / d : NaN;
  }
  const frac = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (frac) {
    const d = Number(frac[2]);
    return d ? Number(frac[1]) / d : NaN;
  }
  const f = Number(s);
  return Number.isFinite(f) ? f : NaN;
}

/** Round to at most 2 decimals and drop trailing zeros: 0.6667 -> "0.67", 2 -> "2". */
export function toDecimalString(value: number): string {
  return String(Math.round(value * 100) / 100);
}

// Common cooking fractions we snap to, so scaled amounts read naturally
// (1 1/2, 3/4, 2/3) instead of 1.5000001 or 0.6666667.
const FRACTIONS: Array<[number, string]> = [
  [0, ''],
  [1 / 8, '1/8'],
  [1 / 4, '1/4'],
  [1 / 3, '1/3'],
  [3 / 8, '3/8'],
  [1 / 2, '1/2'],
  [5 / 8, '5/8'],
  [2 / 3, '2/3'],
  [3 / 4, '3/4'],
  [7 / 8, '7/8'],
  [1, ''],
];

/**
 * Format a (possibly scaled) ingredient amount as a friendly mixed number.
 * e.g. 1.5 -> "1 1/2", 0.75 -> "3/4", 0.6667 -> "2/3", 2 -> "2".
 * Amounts >= 10 are rounded to one decimal (whole-ish) to avoid silly fractions.
 */
export function formatAmount(value: number): string {
  if (!isFinite(value) || value <= 0) return '0';

  // For large amounts, fractions add noise — round sensibly.
  if (value >= 10) {
    const r = Math.round(value * 10) / 10;
    return Number.isInteger(r) ? String(r) : String(r);
  }

  const whole = Math.floor(value);
  const remainder = value - whole;

  // Snap the fractional remainder to the nearest common fraction.
  let best = FRACTIONS[0];
  let bestDist = Infinity;
  for (const f of FRACTIONS) {
    const d = Math.abs(remainder - f[0]);
    if (d < bestDist) {
      bestDist = d;
      best = f;
    }
  }

  // If we snapped up to a full 1, carry into the whole number.
  let wholePart = whole;
  let fracLabel = best[1];
  if (best[0] === 1) {
    wholePart += 1;
    fracLabel = '';
  }

  if (wholePart === 0 && fracLabel === '') {
    // Amount rounds to ~0 but was positive; show a light approximation.
    return '~0';
  }
  if (fracLabel === '') return String(wholePart);
  if (wholePart === 0) return fracLabel;
  return `${wholePart} ${fracLabel}`;
}

/** Turn a minutes count into "1 h 20 min" / "45 min" / "—". */
export function formatDuration(mins: number | undefined | null): string {
  if (mins == null) return '—';
  if (mins <= 0) return '0 min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/** Title-case a lowercase vocabulary value for display: "date-night" -> "Date Night". */
export function labelize(value: string): string {
  return value
    .split(/[-_\s]+/)
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/** Format an ISO date string as "Jul 21, 2026". */
export function formatDate(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
