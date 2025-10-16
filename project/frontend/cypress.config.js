const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    specPattern: '../tests/Cypress/e2e/**/*.cy.{js,jsx,ts,tsx}', 
    baseUrl: 'http://localhost:5173', // Ajusta según la URL de tu frontend
    fixturesFolder: '../tests/Cypress/fixtures',
    supportFolder: '../tests/Cypress/support',
    supportFile: '../tests/Cypress/support/e2e.js',    
    setupNodeEvents(on, config) {
      return config;
    },
    reporter: 'mocha-junit-reporter',
    reporterOptions: {
      mochaFile: '../tests/Cypress/reports/results-[hash].xml',
      toConsole: true,
      useFullTitle: true, 
    },
  },
});