// Servidor 1 - Servidor de paginas estaticas


const express = require('express');
const path = require('path');

const app = express();
const PORTA = 3000;

app.use(express.static(path.join(__dirname, 'publico')));

app.get('/', function (req, res) {
  res.redirect('/cardapio.html');
});

app.listen(PORTA, function () {
  console.log('Servidor 1 (paginas) rodando em http://localhost:' + PORTA);
});