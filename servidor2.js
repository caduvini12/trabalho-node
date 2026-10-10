const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// endereco do servidor 3
const URL_ESTOQUE = 'http://localhost:3002';

// produtos cadastrados na lanchonete
const produtos = [
  { CodProduto: 1, Nome: 'X-Burger', Preco: 18.50 },
  { CodProduto: 2, Nome: 'X-Salada', Preco: 20.00 },
  { CodProduto: 3, Nome: 'Batata Frita', Preco: 12.00 },
  { CodProduto: 4, Nome: 'Refrigerante Lata', Preco: 6.50 },
  { CodProduto: 5, Nome: 'Suco Natural', Preco: 9.00 }
];

let pedidos = [];
let proximoNumeroPedido = 1;

// busca estoque no servidor 3 e monta a lista com preco e quantidade
app.get('/produtos', async function (req, res) {
  try {
    let reqEstoque = await fetch(URL_ESTOQUE + '/estoque');

    if (reqEstoque.ok == false) {
      return res.status(502).json({ erro: 'erro no servidor 3' });
    }

    let estoque = await reqEstoque.json();
    let lista = [];

    for (let i = 0; i < produtos.length; i++) {
      let prod = produtos[i];
      let qtd = 0;

      for (let j = 0; j < estoque.length; j++) {
        if (estoque[j].CodProduto == prod.CodProduto) {
          qtd = estoque[j].Estoque;
        }
      }

      lista.push({
        CodProduto: prod.CodProduto,
        Nome: prod.Nome,
        Preco: prod.Preco,
        Estoque: qtd
      });
    }

    res.json(lista);
  } catch (e) {
    res.status(500).json({ erro: 'estoque fora do ar' });
  }
});

app.get('/pedidos', function (req, res) {
  res.json(pedidos);
});

app.post('/pedidos', async function (req, res) {
  let dados = req.body;

  if (dados.NomeCliente == null || dados.Itens == null) {
    return res.status(400).json({ erro: 'faltou dados' });
  }

  let total = 0;
  let itensSalvar = [];

  for (let i = 0; i < dados.Itens.length; i++) {
    let item = dados.Itens[i];
    let achou = false;

    for (let j = 0; j < produtos.length; j++) {
      if (produtos[j].CodProduto == item.CodProduto) {
        achou = true;

        if (item.Qtd <= 0) {
          return res.status(400).json({ erro: 'quantidade invalida' });
        }

        // calcula o valor total no servidor
        total = total + (produtos[j].Preco * item.Qtd);

        itensSalvar.push({
          CodProduto: produtos[j].CodProduto,
          Nome: produtos[j].Nome,
          Preco: produtos[j].Preco,
          Qtd: item.Qtd
        });
      }
    }

    if (achou == false) {
      return res.status(400).json({ erro: 'produto nao encontrado' });
    }
  }

  // da baixa no servidor 3 antes de registrar o pedido
  try {
    let reqBaixa = await fetch(URL_ESTOQUE + '/baixa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados.Itens)
    });

    let respBaixa = await reqBaixa.json();

    if (reqBaixa.ok == false) {
      return res.status(400).json({ erro: respBaixa.erro });
    }

    let ped = {
      Numero: proximoNumeroPedido,
      NomeCliente: dados.NomeCliente,
      Total: total,
      Itens: itensSalvar
    };

    pedidos.push(ped);
    proximoNumeroPedido++;

    res.json(ped);
  } catch (e) {
    res.status(500).json({ erro: 'erro no estoque' });
  }
});

// fecha pedido e tira da lista
app.post('/pedidos/:id/fechar', function (req, res) {
  let id = parseInt(req.params.id);
  let pos = -1;

  for (let i = 0; i < pedidos.length; i++) {
    if (pedidos[i].Numero == id) {
      pos = i;
    }
  }

  if (pos == -1) {
    return res.status(404).json({ erro: 'nao achou o pedido' });
  }

  pedidos.splice(pos, 1);
  res.json({ mensagem: 'ok' });
});

app.listen(3001, function () {
  console.log('Servidor 2 (pedidos) rodando em http://localhost:3001');
});