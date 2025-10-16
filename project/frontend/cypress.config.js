const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // 1. RUTA DE LAS PRUEBAS (specPattern)
    // Indica a Cypress que suba un nivel (../) y busque en la carpeta 'test/e2e'.
    specPattern: '../tests/e2e/**/*.cy.{js,jsx,ts,tsx}', 

    setupNodeEvents(on, config) {
      // (Si implementaste Cobertura de Código, el código para el plugin iría aquí)
      return config;
    },

    // 2. REPORTERO DE RESULTADOS (reporter)
    // Indica a Cypress que use el reportero JUnit.
    reporter: 'mocha-junit-reporter',

    // 3. OPCIONES DEL REPORTERO (reporterOptions)
    reporterOptions: {
      // Indica la ruta de salida para los archivos XML.
      // '../tests/reports/cypress/' sube un nivel de 'frontend' y guarda en el destino central.
      mochaFile: '../tests/reports/cypress/results-[hash].xml',
      // Esto muestra los resultados también en la consola de tu terminal.
      toConsole: true,
      // Hace que el resultado de la prueba se vea más legible en SonarQube
      useFullTitle: true, 
      // Si usas un CI/CD, a veces es útil tener un prefijo
      // properties: {
      //   browser: 'Cypress-Chrome' 
      // }
    },

    // ... otras configuraciones (baseUrl, videos, screenshots)
  },
});