// @ts-check
'use strict';
const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './e2e', snapshotPathTemplate:'{testDir}/visual-baselines/{projectName}/{arg}{ext}', workers: 1, fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  projects: [
    {name:'chromium',use:{...devices['Desktop Chrome']}},
    {name:'firefox',use:{...devices['Desktop Firefox']}},
    {name:'webkit',use:{...devices['Desktop Safari']}},
    {name:'mobile-webkit',use:{...devices['iPhone 13']}}
  ],
  use: { serviceWorkers: 'block', baseURL: 'http://127.0.0.1:4173', ...devices['Desktop Chrome'], trace: 'on-first-retry' },
  webServer: { command: 'node tools/static-server.js 4173', url: 'http://127.0.0.1:4173/', reuseExistingServer: !process.env.CI }
});
