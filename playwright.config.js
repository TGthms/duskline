// @ts-check
'use strict';
const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './e2e', workers: 1, fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: 'http://127.0.0.1:4173', ...devices['Desktop Chrome'], trace: 'on-first-retry' },
  webServer: { command: 'node tools/static-server.js 4173', url: 'http://127.0.0.1:4173/', reuseExistingServer: !process.env.CI }
});
