// World units are metres. Drawings are in feet-inches.
export const IN = 0.0254; // metres per inch (exact)
export const FT = 0.3048; // metres per foot (exact)

export const inch = (v) => v * IN;

// "12′-3½″"-style string for a length in metres (rounded to the nearest ⅛″).
export function ftIn(m) {
  const sign = m < 0 ? '−' : '';
  let eighths = Math.round((Math.abs(m) / IN) * 8);
  let ft = Math.floor(eighths / 96);
  eighths -= ft * 96;
  let whole = Math.floor(eighths / 8);
  const frac = eighths % 8;
  const fr = ['', '⅛', '¼', '⅜', '½', '⅝', '¾', '⅞'][frac];
  if (ft === 0) return `${sign}${whole}${fr}″`;
  return `${sign}${ft}′-${whole}${fr}″`;
}

export const metres = (m, d = 3) => `${m.toFixed(d)} m`;
