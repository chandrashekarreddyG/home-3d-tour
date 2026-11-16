// Solar position (NOAA low-precision algorithm, ~0.5° accuracy) for the real site location.
const rad = Math.PI / 180;

// date: JS Date (absolute instant). Returns azimuth (radians, clockwise from true north) and elevation.
export function sunPosition(date, lat, lon) {
  const n = date.getTime() / 86400000 + 2440587.5 - 2451545.0; // days since J2000
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * rad;
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * rad;
  const eps = (23.439 - 0.0000004 * n) * rad;
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda));
  const dec = Math.asin(Math.sin(eps) * Math.sin(lambda));
  const gmst = (18.697374558 + 24.06570982441908 * n) % 24;
  const H = ((gmst * 15 + lon) * rad) - ra;
  const phi = lat * rad;
  const el = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
  const az = Math.atan2(-Math.sin(H), Math.tan(dec) * Math.cos(phi) - Math.sin(phi) * Math.cos(H));
  return { az: (az + 2 * Math.PI) % (2 * Math.PI), el };
}

// Indian Standard Time (UTC+5:30) wall-clock → Date
export function istDate(yyyy_mm_dd, minutes) {
  const [y, m, d] = yyyy_mm_dd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0) + (minutes - 330) * 60000);
}
