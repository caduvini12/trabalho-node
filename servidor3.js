const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

// controle de estoque em memoria
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

// baixa atomica no estoque
app.post('/baixa', function (req, res) {
  let itens = req.body;

  // confere se todos os itens tem estoque antes de descontar
  for (let i = 0; i < itens.length; i++) {
    let item = itens[i];
    let achou = false;

    for (let j = 0; j < estoque.length; j++) {
      if (estoque[j].CodProduto == item.CodProduto) {
        achou = true;
        if (estoque[j].Estoque < item.Qtd) {
          return res.status(400).json({ erro: 'estoque insuficiente' });
        }
      }
    }

    if (achou == false) {
      return res.status(404).json({ erro: 'produto nao encontrado no estoque' });
    }
  }

  // desconta as quantidades
  for (let i = 0; i < itens.length; i++) {
    let item = itens[i];

    for (let j = 0; j < estoque.length; j++) {
      if (estoque[j].CodProduto == item.CodProduto) {
        estoque[j].Estoque = estoque[j].Estoque - item.Qtd;
      }
    }
  }

  res.json({ mensagem: 'baixa feita' });
});

// repoe estoque para testes
app.post('/reposicao', function (req, res) {
  let itens = req.body;

  if (!itens) {
    return res.status(400).json({ erro: 'faltou dados' });
  }

  if (!Array.isArray(itens)) {
    itens = [itens];
  }

  for (let i = 0; i < itens.length; i++) {
    let item = itens[i];
    if (item.CodProduto == null || item.Qtd == null || item.Qtd <= 0) {
      return res.status(400).json({ erro: 'dados invalidos para reposicao' });
    }

    let achou = false;
    for (let j = 0; j < estoque.length; j++) {
      if (estoque[j].CodProduto == item.CodProduto) {
        estoque[j].Estoque = estoque[j].Estoque + item.Qtd;
        achou = true;
        break;
      }
    }

    if (achou == false) {
      return res.status(404).json({ erro: 'produto nao encontrado' });
    }
  }

  res.json({ mensagem: 'reposicao feita' });
});

app.listen(3002, function () {
  console.log('Servidor 3 (estoque) rodando em http://localhost:3002');
});
