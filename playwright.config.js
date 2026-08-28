// @ts-check
'use strict';
const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './e2e', workers: 1, fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:4173', ...devices['Desktop Chrome'] },
  webServer: { command: 'node tools/static-server.js 4173', url: 'http://127.0.0.1:4173/', reuseExistingServer: !process.env.CI }
});
