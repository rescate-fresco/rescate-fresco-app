const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    specPattern: '../tests/e2e/**/*.cy.{js,jsx,ts,tsx}', 
    baseUrl: 'http://localhost:5173', // Ajusta según la URL de tu frontend
    setupNodeEvents(on, config) {
      return config;
    },
    reporter: 'mocha-junit-reporter',
    reporterOptions: {
      mochaFile: '../tests/reports/cypress/results-[hash].xml',
      toConsole: true,
      useFullTitle: true, 
    },
  },
});