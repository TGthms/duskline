'use strict';
/* Duskline's curated default city catalog. Coordinates are static so the list
   can render immediately while weather providers refresh in the background. */
(function () {
  var CITIES = [
    { region: 'North America', name: 'New York', admin1: 'New York', country: 'United States', lat: 40.7128, lon: -74.006, tz: 'America/New_York', slug: 'nyc' },
    { region: 'North America', name: 'Los Angeles', admin1: 'California', country: 'United States', lat: 34.0522, lon: -118.2437, tz: 'America/Los_Angeles', slug: 'la' },
    { region: 'North America', name: 'San Francisco', admin1: 'California', country: 'United States', lat: 37.7749, lon: -122.4194, tz: 'America/Los_Angeles', slug: 'sf' },
    { region: 'North America', name: 'Chicago', admin1: 'Illinois', country: 'United States', lat: 41.8781, lon: -87.6298, tz: 'America/Chicago', slug: 'chicago' },
    { region: 'North America', name: 'Toronto', admin1: 'Ontario', country: 'Canada', lat: 43.6532, lon: -79.3832, tz: 'America/Toronto', slug: 'toronto' },
    { region: 'North America', name: 'Vancouver', admin1: 'British Columbia', country: 'Canada', lat: 49.2827, lon: -123.1207, tz: 'America/Vancouver', slug: 'vancouver' },
    { region: 'North America', name: 'Mexico City', admin1: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332, tz: 'America/Mexico_City', slug: 'mexico-city' },
    { region: 'South America', name: 'São Paulo', admin1: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333, tz: 'America/Sao_Paulo', slug: 'sao-paulo' },
    { region: 'South America', name: 'Buenos Aires', admin1: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lon: -58.3816, tz: 'America/Argentina/Buenos_Aires', slug: 'buenos-aires' },
    { region: 'South America', name: 'Santiago', admin1: 'Santiago Metropolitan', country: 'Chile', lat: -33.4489, lon: -70.6693, tz: 'America/Santiago', slug: 'santiago' },
    { region: 'South America', name: 'Lima', admin1: 'Lima', country: 'Peru', lat: -12.0464, lon: -77.0428, tz: 'America/Lima', slug: 'lima' },
    { region: 'Europe', name: 'London', admin1: 'England', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, tz: 'Europe/London', slug: 'london' },
    { region: 'Europe', name: 'Paris', admin1: 'Île-de-France', country: 'France', lat: 48.8566, lon: 2.3522, tz: 'Europe/Paris', slug: 'paris' },
    { region: 'Europe', name: 'Madrid', admin1: 'Community of Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038, tz: 'Europe/Madrid', slug: 'madrid' },
    { region: 'Europe', name: 'Rome', admin1: 'Lazio', country: 'Italy', lat: 41.9028, lon: 12.4964, tz: 'Europe/Rome', slug: 'rome' },
    { region: 'Europe', name: 'Berlin', admin1: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.405, tz: 'Europe/Berlin', slug: 'berlin' },
    { region: 'Europe', name: 'Istanbul', admin1: 'Istanbul', country: 'Türkiye', lat: 41.0082, lon: 28.9784, tz: 'Europe/Istanbul', slug: 'istanbul' },
    { region: 'Europe', name: 'Reykjavík', admin1: 'Capital Region', country: 'Iceland', lat: 64.1466, lon: -21.9426, tz: 'Atlantic/Reykjavik', slug: 'reykjavik' },
    { region: 'Middle East', name: 'Dubai', admin1: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708, tz: 'Asia/Dubai', slug: 'dubai' },
    { region: 'Middle East', name: 'Riyadh', admin1: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lon: 46.6753, tz: 'Asia/Riyadh', slug: 'riyadh' },
    { region: 'Middle East', name: 'Tel Aviv', admin1: 'Tel Aviv District', country: 'Israel', lat: 32.0853, lon: 34.7818, tz: 'Asia/Jerusalem', slug: 'tel-aviv' },
    { region: 'Africa', name: 'Cairo', admin1: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357, tz: 'Africa/Cairo', slug: 'cairo' },
    { region: 'Africa', name: 'Nairobi', admin1: 'Nairobi County', country: 'Kenya', lat: -1.2921, lon: 36.8219, tz: 'Africa/Nairobi', slug: 'nairobi' },
    { region: 'Africa', name: 'Cape Town', admin1: 'Western Cape', country: 'South Africa', lat: -33.9249, lon: 18.4241, tz: 'Africa/Johannesburg', slug: 'cape-town' },
    { region: 'Africa', name: 'Johannesburg', admin1: 'Gauteng', country: 'South Africa', lat: -26.2041, lon: 28.0473, tz: 'Africa/Johannesburg', slug: 'johannesburg' },
    { region: 'Asia', name: 'Tokyo', admin1: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo', slug: 'tokyo' },
    { region: 'Asia', name: 'Seoul', admin1: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.978, tz: 'Asia/Seoul', slug: 'seoul' },
    { region: 'Asia', name: 'Beijing', admin1: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074, tz: 'Asia/Shanghai', slug: 'beijing' },
    { region: 'Asia', name: 'Hong Kong', admin1: 'Hong Kong', country: 'Hong Kong', lat: 22.3193, lon: 114.1694, tz: 'Asia/Hong_Kong', slug: 'hong-kong' },
    { region: 'Asia', name: 'Singapore', admin1: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore', slug: 'singapore' },
    { region: 'Asia', name: 'Bangkok', admin1: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018, tz: 'Asia/Bangkok', slug: 'bangkok' },
    { region: 'Asia', name: 'Mumbai', admin1: 'Maharashtra', country: 'India', lat: 19.076, lon: 72.8777, tz: 'Asia/Kolkata', slug: 'mumbai' },
    { region: 'Asia', name: 'Delhi', admin1: 'Delhi', country: 'India', lat: 28.6139, lon: 77.209, tz: 'Asia/Kolkata', slug: 'delhi' },
    { region: 'Oceania', name: 'Sydney', admin1: 'New South Wales', country: 'Australia', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney', slug: 'sydney' },
    { region: 'Oceania', name: 'Melbourne', admin1: 'Victoria', country: 'Australia', lat: -37.8136, lon: 144.9631, tz: 'Australia/Melbourne', slug: 'melbourne' },
    { region: 'Oceania', name: 'Auckland', admin1: 'Auckland', country: 'New Zealand', lat: -36.8509, lon: 174.7645, tz: 'Pacific/Auckland', slug: 'auckland' }
  ];
  var slugs = {};
  CITIES.forEach(function (c) { slugs[c.slug] = c; });
  window.WEATHER_CITIES = CITIES;
  window.DEST_WEATHER_CITIES = slugs;
})();
