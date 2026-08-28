'use strict';
/**
 * Weather city list — one object per city.
 * Homepage dest chips and tools-weather.html?city= use DEST_WEATHER_CITIES (slug → same object).
 * Weather majors iterate WEATHER_CITIES.
 */
(function () {
  var CITIES = [
    { slug: 'nyc', name: 'New York', admin1: 'New York', lat: 40.7128, lon: -74.006, tz: 'America/New_York' },
    { slug: 'la', name: 'Los Angeles', admin1: 'California', lat: 34.0522, lon: -118.2437, tz: 'America/Los_Angeles' },
    { name: 'Chicago', admin1: 'Illinois', lat: 41.8781, lon: -87.6298, tz: 'America/Chicago', slug: 'chicago' },
    { name: 'Houston', admin1: 'Texas', lat: 29.7604, lon: -95.3698, tz: 'America/Chicago' },
    { name: 'Phoenix', admin1: 'Arizona', lat: 33.4484, lon: -112.074, tz: 'America/Phoenix' },
    { name: 'Philadelphia', admin1: 'Pennsylvania', lat: 39.9526, lon: -75.1652, tz: 'America/New_York' },
    { name: 'San Antonio', admin1: 'Texas', lat: 29.4241, lon: -98.4936, tz: 'America/Chicago' },
    { name: 'San Diego', admin1: 'California', lat: 32.7157, lon: -117.1611, tz: 'America/Los_Angeles' },
    { name: 'Dallas', admin1: 'Texas', lat: 32.7767, lon: -96.797, tz: 'America/Chicago' },
    { name: 'San Jose', admin1: 'California', lat: 37.3382, lon: -121.8863, tz: 'America/Los_Angeles' },
    { slug: 'austin', name: 'Austin', admin1: 'Texas', lat: 30.2672, lon: -97.7431, tz: 'America/Chicago' },
    { name: 'Jacksonville', admin1: 'Florida', lat: 30.3322, lon: -81.6557, tz: 'America/New_York' },
    { slug: 'sf', name: 'San Francisco', admin1: 'California', lat: 37.7749, lon: -122.4194, tz: 'America/Los_Angeles' },
    { name: 'Columbus', admin1: 'Ohio', lat: 39.9612, lon: -82.9988, tz: 'America/New_York' },
    { name: 'Charlotte', admin1: 'North Carolina', lat: 35.2271, lon: -80.8431, tz: 'America/New_York' },
    { name: 'Indianapolis', admin1: 'Indiana', lat: 39.7684, lon: -86.1581, tz: 'America/Indiana/Indianapolis' },
    { slug: 'seattle', name: 'Seattle', admin1: 'Washington', lat: 47.6062, lon: -122.3321, tz: 'America/Los_Angeles' },
    { name: 'Denver', admin1: 'Colorado', lat: 39.7392, lon: -104.9903, tz: 'America/Denver' },
    { slug: 'dc', name: 'Washington', admin1: 'District of Columbia', lat: 38.9072, lon: -77.0369, tz: 'America/New_York' },
    { slug: 'boston', name: 'Boston', admin1: 'Massachusetts', lat: 42.3601, lon: -71.0589, tz: 'America/New_York' },
    { name: 'Nashville', admin1: 'Tennessee', lat: 36.1627, lon: -86.7816, tz: 'America/Chicago' },
    { name: 'Detroit', admin1: 'Michigan', lat: 42.3314, lon: -83.0458, tz: 'America/Detroit' },
    { name: 'Portland', admin1: 'Oregon', lat: 45.5152, lon: -122.6784, tz: 'America/Los_Angeles' },
    { slug: 'vegas', name: 'Las Vegas', admin1: 'Nevada', lat: 36.1699, lon: -115.1398, tz: 'America/Los_Angeles' },
    { name: 'Memphis', admin1: 'Tennessee', lat: 35.1495, lon: -90.049, tz: 'America/Chicago' },
    { name: 'Louisville', admin1: 'Kentucky', lat: 38.2527, lon: -85.7585, tz: 'America/Kentucky/Louisville' },
    { name: 'Baltimore', admin1: 'Maryland', lat: 39.2904, lon: -76.6122, tz: 'America/New_York' },
    { name: 'Milwaukee', admin1: 'Wisconsin', lat: 43.0389, lon: -87.9065, tz: 'America/Chicago' },
    { name: 'Albuquerque', admin1: 'New Mexico', lat: 35.0844, lon: -106.6504, tz: 'America/Denver' },
    { name: 'Tucson', admin1: 'Arizona', lat: 32.2226, lon: -110.9747, tz: 'America/Phoenix' },
    { name: 'Fresno', admin1: 'California', lat: 36.7378, lon: -119.7871, tz: 'America/Los_Angeles' },
    { name: 'Sacramento', admin1: 'California', lat: 38.5816, lon: -121.4944, tz: 'America/Los_Angeles' },
    { name: 'Atlanta', admin1: 'Georgia', lat: 33.749, lon: -84.388, tz: 'America/New_York' },
    { slug: 'miami', name: 'Miami', admin1: 'Florida', lat: 25.7617, lon: -80.1918, tz: 'America/New_York' },
    { slug: 'nola', name: 'New Orleans', admin1: 'Louisiana', lat: 29.9511, lon: -90.0715, tz: 'America/Chicago' },
    { name: 'Minneapolis', admin1: 'Minnesota', lat: 44.9778, lon: -93.265, tz: 'America/Chicago' },
    { name: 'Salt Lake City', admin1: 'Utah', lat: 40.7608, lon: -111.891, tz: 'America/Denver' },
    { slug: 'honolulu', name: 'Honolulu', admin1: 'Hawaii', lat: 21.3069, lon: -157.8583, tz: 'Pacific/Honolulu' },
    { name: 'Anchorage', admin1: 'Alaska', lat: 61.2181, lon: -149.9003, tz: 'America/Anchorage' },
    { name: 'London', admin1: 'England', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
    { name: 'Paris', admin1: 'Île-de-France', country: 'France', lat: 48.8566, lon: 2.3522, tz: 'Europe/Paris' },
    { name: 'Tokyo', admin1: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo' },
    { name: 'Sydney', admin1: 'New South Wales', country: 'Australia', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney' },
    { name: 'Singapore', admin1: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
    { name: 'Mexico City', admin1: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332, tz: 'America/Mexico_City' },
    { name: 'São Paulo', admin1: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333, tz: 'America/Sao_Paulo' },
    { name: 'Cape Town', admin1: 'Western Cape', country: 'South Africa', lat: -33.9249, lon: 18.4241, tz: 'Africa/Johannesburg' },
    { name: 'Dubai', admin1: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708, tz: 'Asia/Dubai' },
    { name: 'Reykjavik', admin1: 'Capital Region', country: 'Iceland', lat: 64.1466, lon: -21.9426, tz: 'Atlantic/Reykjavik' }
  ];

  var slugs = {};
  CITIES.forEach(function (c) {
    if (c.slug) slugs[c.slug] = c;
  });

  window.WEATHER_CITIES = CITIES;
  window.DEST_WEATHER_CITIES = slugs;
})();
