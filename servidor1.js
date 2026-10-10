// Servidor 1 
const express = require('express');
const path = require('path');

const app = express();


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.redirect('/cardapio.html');
});

app.listen(3000, function () {
  console.log('Servidor 1 (paginas) rodando em http://localhost:3000');
});
