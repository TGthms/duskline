'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const math = require('../src/js/core/wx-math.js');

test('escapeHtml keeps 0 and false', () => {
  assert.equal(math.escapeHtml(0), '0');
  assert.equal(math.escapeHtml(false), 'false');
  assert.equal(math.escapeHtml(null), '');
  assert.equal(math.escapeHtml('<x>'), '&lt;x&gt;');
});

test('temperature conversion', () => {
  assert.equal(math.fmtTempFromC(0, false), '0°');
  assert.equal(math.fmtTempFromC(0, true), '32°');
  assert.equal(math.fmtTempFromC(100, true), '212°');
  assert.equal(math.fmtTempFromC(null, false), '—');
});

test('wind conversion', () => {
  assert.equal(math.windMsTo('mph', 1), 2.23694);
  assert.equal(math.windMsTo('kmh', 1), 3.6);
  assert.equal(math.fmtWind(10, 'kmh'), '36 km/h');
  assert.equal(math.fmtWind(null, 'kmh'), '—');
});

test('precip and pressure conversion', () => {
  assert.equal(math.fmtPrecip(25.4, 'in'), '1.00 in');
  assert.equal(math.fmtPrecip(10, 'mm'), '10.0 mm');
  assert.equal(math.fmtPress(1013.25, 'hPa'), '1013 hPa');
  assert.equal(math.fmtVis(16093.4, true), '10.0 mi');
});

test('hourFromIso uses wall-clock hour, not browser TZ, for bare ISO', () => {
  assert.equal(math.hourFromIso('2026-08-30T03:15'), 3.25);
  assert.equal(math.hourFromIso('2026-08-30T22:00:00'), 22);
});

test('hourFromIso uses city timezone for offset timestamps', () => {
  const h = math.hourFromIso('2026-08-30T04:00:00Z', 'America/New_York');
  assert.equal(h, 0);
});

test('wallClockInZoneToUtcMs maps Tokyo wall-clock independently of UTC', () => {
  const ms = math.wallClockInZoneToUtcMs('2026-07-15T12:00:00', 'Asia/Tokyo');
  assert.ok(Number.isFinite(ms));
  const utcHour = new Date(ms).getUTCHours();
  assert.equal(utcHour, 3);
});

test('startOfLocalDayUtcMs on US DST spring-forward date', () => {
  const noon = Date.parse('2026-03-08T17:00:00Z');
  const start = math.startOfLocalDayUtcMs(noon, 'America/New_York');
  assert.ok(Number.isFinite(start));
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date(start));
  const get = (type) => parts.find((p) => p.type === type).value;
  assert.equal(get('year') + '-' + get('month') + '-' + get('day'), '2026-03-08');
  assert.equal(get('hour'), '00');
  assert.equal(get('minute'), '00');
});
