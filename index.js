const express = require("express");
const bodyParser = require('body-parser');
const router = require('./src/controller/controller');

const app = express(); // Creates express app
const port = 8080

// Setup express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  // Logs each incoming request
  console.info({path: req.path, method: req.method, body: req.body, params: req.params, query: req.query})
  next();
});

app.get('/', (request, response) => {
  response.json({ info: 'ParagonERP webshop API' })
})

app.use('/api', router)

app.listen(port, () => {
  console.log(`Webshop API running on port ${port}.`)
})