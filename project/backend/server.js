const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000; // Puedes usar cualquier puerto

// Usa las dependencias
app.use(express.json()); // Permite que el servidor entienda el JSON
app.use(cors()); // Habilita CORS

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor del backend funcionando correctamente!');
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`El servidor del backend está corriendo en http://localhost:${port}`);
});