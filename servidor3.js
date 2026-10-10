
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());


let estoque = [
  { CodProduto: 1, Estoque: 50 },
  { CodProduto: 2, Estoque: 50 },
  { CodProduto: 3, Estoque: 100 },
  { CodProduto: 4, Estoque: 200 },
  { CodProduto: 5, Estoque: 80 }
];


app.get('/estoque', function (req, res) {
  res.json(estoque);
});


app.post('/baixa', function (req, res) {
  let itens = req.body;

  if (Array.isArray(itens) == false || itens.length == 0) {
    return res.status(400).json({ erro: 'envie uma lista de itens' });
  }


  let copia = [];
  for (let j = 0; j < estoque.length; j++) {
    copia.push(estoque[j].Estoque);
  }


  for (let i = 0; i < itens.length; i++) {
    let item = itens[i];

    if (item === null || typeof item !== 'object') {
      return res.status(400).json({ erro: 'item invalido' });
    }


    if (Number.isInteger(item.Qtd) == false || item.Qtd <= 0) {
      return res.status(400).json({ erro: 'quantidade invalida' });
    }

    let achou = false;

    for (let j = 0; j < estoque.length; j++) {
      if (estoque[j].CodProduto === item.CodProduto) {
        achou = true;

       
        copia[j] = copia[j] - item.Qtd;

        if (copia[j] < 0) {
          return res.status(400).json({ erro: 'estoque insuficiente' });
        }
      }
    }

    if (achou == false) {
      return res.status(404).json({ erro: 'produto nao encontrado no estoque' });
    }
  }

  
  for (let j = 0; j < estoque.length; j++) {
    estoque[j].Estoque = copia[j];
  }

  res.json({ mensagem: 'baixa feita' });
});


app.post('/reposicao', function (req, res) {
  let itens = req.body;

  
  if (Array.isArray(itens) == false) {
    itens = [itens];
  }

  if (itens.length == 0) {
    return res.status(400).json({ erro: 'faltou dados' });
  }


  for (let i = 0; i < itens.length; i++) {
    let item = itens[i];

    if (item === null || typeof item !== 'object') {
      return res.status(400).json({ erro: 'dados invalidos para reposicao' });
    }

    if (Number.isInteger(item.Qtd) == false || item.Qtd <= 0) {
      return res.status(400).json({ erro: 'dados invalidos para reposicao' });
    }

    let achou = false;
    for (let j = 0; j < estoque.length; j++) {
      if (estoque[j].CodProduto === item.CodProduto) {
        achou = true;
      }
    }

    if (achou == false) {
      return res.status(404).json({ erro: 'produto nao encontrado' });
    }
  }

  // soma no estoque
  for (let i = 0; i < itens.length; i++) {
    for (let j = 0; j < estoque.length; j++) {
      if (estoque[j].CodProduto === itens[i].CodProduto) {
        estoque[j].Estoque = estoque[j].Estoque + itens[i].Qtd;
      }
    }
  }

  res.json({ mensagem: 'reposicao feita' });
});

app.listen(3002, function () {
  console.log('Servidor 3 (estoque) rodando em http://localhost:3002');
});
