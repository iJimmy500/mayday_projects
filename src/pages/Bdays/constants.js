export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export const TODAY     = new Date();
export const THIS_YEAR = TODAY.getFullYear();

// ─── Timezone → approximate city coords ───────────────────────
const TZ_COORDS = {
  'America/New_York':     { lat: 40.71, lon: -74.01, city: 'New York',      imperial: true  },
  'America/Chicago':      { lat: 41.85, lon: -87.65, city: 'Chicago',       imperial: true  },
  'America/Denver':       { lat: 39.74, lon: -104.98, city: 'Denver',       imperial: true  },
  'America/Los_Angeles':  { lat: 34.05, lon: -118.24, city: 'Los Angeles',  imperial: true  },
  'America/Phoenix':      { lat: 33.45, lon: -112.07, city: 'Phoenix',      imperial: true  },
  'America/Anchorage':    { lat: 61.22, lon: -149.90, city: 'Anchorage',    imperial: true  },
  'America/Toronto':      { lat: 43.65, lon: -79.38, city: 'Toronto',       imperial: false },
  'America/Vancouver':    { lat: 49.25, lon: -123.12, city: 'Vancouver',    imperial: false },
  'America/Mexico_City':  { lat: 19.43, lon: -99.13,  city: 'Mexico City',  imperial: false },
  'America/Sao_Paulo':    { lat: -23.55, lon: -46.63, city: 'São Paulo',    imperial: false },
  'America/Buenos_Aires': { lat: -34.60, lon: -58.38, city: 'Buenos Aires', imperial: false },
  'America/Bogota':       { lat: 4.71,  lon: -74.07,  city: 'Bogotá',       imperial: false },
  'America/Lima':         { lat: -12.05, lon: -77.04, city: 'Lima',         imperial: false },
  'America/Santiago':     { lat: -33.45, lon: -70.67, city: 'Santiago',     imperial: false },
  'Pacific/Honolulu':     { lat: 21.31, lon: -157.86, city: 'Honolulu',     imperial: true  },
  'Europe/London':        { lat: 51.51, lon: -0.13,   city: 'London',       imperial: false },
  'Europe/Paris':         { lat: 48.85, lon: 2.35,    city: 'Paris',        imperial: false },
  'Europe/Berlin':        { lat: 52.52, lon: 13.40,   city: 'Berlin',       imperial: false },
  'Europe/Rome':          { lat: 41.90, lon: 12.50,   city: 'Rome',         imperial: false },
  'Europe/Madrid':        { lat: 40.42, lon: -3.70,   city: 'Madrid',       imperial: false },
  'Europe/Amsterdam':     { lat: 52.37, lon: 4.90,    city: 'Amsterdam',    imperial: false },
  'Europe/Stockholm':     { lat: 59.33, lon: 18.07,   city: 'Stockholm',    imperial: false },
  'Europe/Oslo':          { lat: 59.91, lon: 10.75,   city: 'Oslo',         imperial: false },
  'Europe/Copenhagen':    { lat: 55.68, lon: 12.57,   city: 'Copenhagen',   imperial: false },
  'Europe/Warsaw':        { lat: 52.23, lon: 21.01,   city: 'Warsaw',       imperial: false },
  'Europe/Vienna':        { lat: 48.21, lon: 16.37,   city: 'Vienna',       imperial: false },
  'Europe/Zurich':        { lat: 47.38, lon: 8.54,    city: 'Zurich',       imperial: false },
  'Europe/Lisbon':        { lat: 38.72, lon: -9.14,   city: 'Lisbon',       imperial: false },
  'Europe/Athens':        { lat: 37.98, lon: 23.73,   city: 'Athens',       imperial: false },
  'Europe/Moscow':        { lat: 55.75, lon: 37.62,   city: 'Moscow',       imperial: false },
  'Europe/Istanbul':      { lat: 41.01, lon: 28.95,   city: 'Istanbul',     imperial: false },
  'Asia/Tokyo':           { lat: 35.69, lon: 139.69,  city: 'Tokyo',        imperial: false },
  'Asia/Shanghai':        { lat: 31.23, lon: 121.47,  city: 'Shanghai',     imperial: false },
  'Asia/Seoul':           { lat: 37.57, lon: 126.98,  city: 'Seoul',        imperial: false },
  'Asia/Singapore':       { lat: 1.35,  lon: 103.82,  city: 'Singapore',    imperial: false },
  'Asia/Dubai':           { lat: 25.20, lon: 55.27,   city: 'Dubai',        imperial: false },
  'Asia/Kolkata':         { lat: 22.57, lon: 88.36,   city: 'Kolkata',      imperial: false },
  'Asia/Bangkok':         { lat: 13.75, lon: 100.52,  city: 'Bangkok',      imperial: false },
  'Asia/Jakarta':         { lat: -6.21, lon: 106.85,  city: 'Jakarta',      imperial: false },
  'Asia/Hong_Kong':       { lat: 22.32, lon: 114.17,  city: 'Hong Kong',    imperial: false },
  'Asia/Taipei':          { lat: 25.05, lon: 121.53,  city: 'Taipei',       imperial: false },
  'Asia/Manila':          { lat: 14.60, lon: 120.98,  city: 'Manila',       imperial: false },
  'Asia/Karachi':         { lat: 24.86, lon: 67.01,   city: 'Karachi',      imperial: false },
  'Asia/Riyadh':          { lat: 24.69, lon: 46.72,   city: 'Riyadh',       imperial: false },
  'Asia/Tehran':          { lat: 35.69, lon: 51.42,   city: 'Tehran',       imperial: false },
  'Asia/Jerusalem':       { lat: 31.77, lon: 35.22,   city: 'Jerusalem',    imperial: false },
  'Australia/Sydney':     { lat: -33.87, lon: 151.21, city: 'Sydney',       imperial: false },
  'Australia/Melbourne':  { lat: -37.81, lon: 144.96, city: 'Melbourne',    imperial: false },
  'Australia/Brisbane':   { lat: -27.47, lon: 153.03, city: 'Brisbane',     imperial: false },
  'Australia/Perth':      { lat: -31.95, lon: 115.86, city: 'Perth',        imperial: false },
  'Pacific/Auckland':     { lat: -36.85, lon: 174.76, city: 'Auckland',     imperial: false },
  'Africa/Lagos':         { lat: 6.45,  lon: 3.40,    city: 'Lagos',        imperial: false },
  'Africa/Johannesburg':  { lat: -26.20, lon: 28.04,  city: 'Johannesburg', imperial: false },
  'Africa/Cairo':         { lat: 30.04, lon: 31.24,   city: 'Cairo',        imperial: false },
  'Africa/Nairobi':       { lat: -1.29, lon: 36.82,   city: 'Nairobi',      imperial: false },
  'Africa/Casablanca':    { lat: 33.59, lon: -7.62,   city: 'Casablanca',   imperial: false },
};

export function getUserLocation() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  if (TZ_COORDS[tz]) return { ...TZ_COORDS[tz], tz };
  // Continent-level fallbacks
  if (tz.startsWith('America/'))    return { lat: 40.71, lon: -74.01, city: 'New York',   imperial: true,  tz };
  if (tz.startsWith('Europe/'))     return { lat: 51.51, lon: -0.13,  city: 'London',     imperial: false, tz };
  if (tz.startsWith('Asia/'))       return { lat: 35.69, lon: 139.69, city: 'Tokyo',      imperial: false, tz };
  if (tz.startsWith('Australia/'))  return { lat: -33.87, lon: 151.21, city: 'Sydney',    imperial: false, tz };
  if (tz.startsWith('Pacific/'))    return { lat: -36.85, lon: 174.76, city: 'Auckland',  imperial: false, tz };
  if (tz.startsWith('Africa/'))     return { lat: 6.45,  lon: 3.40,   city: 'Lagos',      imperial: false, tz };
  return { lat: 40.71, lon: -74.01, city: 'New York', imperial: true, tz };
}

// ─── WMO weather code → description + emoji ───────────────────
export const WMO = {
  0:  ['Clear sky', '☀️'],
  1:  ['Mainly clear', '🌤'],
  2:  ['Partly cloudy', '⛅'],
  3:  ['Overcast', '☁️'],
  45: ['Fog', '🌫'],
  48: ['Icy fog', '🌫'],
  51: ['Light drizzle', '🌦'],
  53: ['Drizzle', '🌦'],
  55: ['Heavy drizzle', '🌧'],
  61: ['Light rain', '🌧'],
  63: ['Rain', '🌧'],
  65: ['Heavy rain', '🌧'],
  71: ['Light snow', '🌨'],
  73: ['Snow', '❄️'],
  75: ['Heavy snow', '❄️'],
  77: ['Snow grains', '❄️'],
  80: ['Rain showers', '🌦'],
  81: ['Showers', '🌦'],
  82: ['Heavy showers', '🌧'],
  85: ['Snow showers', '🌨'],
  86: ['Heavy snow showers', '🌨'],
  95: ['Thunderstorm', '⛈'],
  96: ['Thunderstorm with hail', '⛈'],
  99: ['Severe thunderstorm', '⛈'],
};
