

const express = require('express');

const app = express();
const PORTA = 3001;
const URL_ESTOQUE = 'http://localhost:3002';

app.use(express.json());

// Libera o acesso das paginas (porta 3000) a esta API (porta 3001)
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Dados em memoria
const produtos = [
  { CodProduto: 1, Nome: 'X-Burger', Preco: 18.50 },
  { CodProduto: 2, Nome: 'X-Salada', Preco: 20.00 },
  { CodProduto: 3, Nome: 'Batata Frita', Preco: 12.00 },
  { CodProduto: 4, Nome: 'Refrigerante Lata', Preco: 6.50 },
  { CodProduto: 5, Nome: 'Suco Natural', Preco: 9.00 }
];

let pedidos = [];
let proximoNumeroPedido = 1;


app.get('/produtos', async function (req, res) {
  try {
    const respostaEstoque = await fetch(URL_ESTOQUE + '/estoque');

    if (!respostaEstoque.ok) {
      return res.status(502).json({
        erro: 'O servidor de estoque retornou um erro.'
      });
    }

    const listaEstoque = await respostaEstoque.json();
    const catalogo = [];

    for (let i = 0; i < produtos.length; i++) {
      const produto = produtos[i];
      let quantidadeEstoque = 0;

      for (let j = 0; j < listaEstoque.length; j++) {
        if (listaEstoque[j].CodProduto === produto.CodProduto) {
          quantidadeEstoque = listaEstoque[j].Estoque;
        }
      }

      catalogo.push({
        CodProduto: produto.CodProduto,
        Nome: produto.Nome,
        Preco: produto.Preco,
        Estoque: quantidadeEstoque
      });
    }

    res.json(catalogo);
  } catch (erro) {
    res.status(503).json({
      erro: 'Servidor de estoque indisponível. Tente novamente mais tarde.'
    });
  }
});

// GET /pedidos
app.get('/pedidos', function (req, res) {
  res.json(pedidos);
});

// POST /pedidos/:id/fechar
app.post('/pedidos/:id/fechar', function (req, res) {
  const numero = parseInt(req.params.id);
  let posicao = -1;

  for (let i = 0; i < pedidos.length; i++) {
    if (pedidos[i].Numero === numero) {
      posicao = i;
    }
  }

  if (posicao === -1) {
    return res.status(404).json({ erro: 'Pedido não encontrado.' });
  }

  pedidos.splice(posicao, 1);
  res.json({ mensagem: 'Pedido ' + numero + ' fechado.' });
});

app.listen(PORTA, function () {
  console.log('Servidor 2 (pedidos) rodando em http://localhost:' + PORTA);
});