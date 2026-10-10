
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());


const URL_ESTOQUE = 'http://localhost:3002';

// produtos da lanchonete
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
    let reqEstoque = await fetch(URL_ESTOQUE + '/estoque');

    if (reqEstoque.ok == false) {
      return res.status(502).json({ erro: 'erro no servidor de estoque' });
    }

    let estoque = await reqEstoque.json();
    let lista = [];

    for (let i = 0; i < produtos.length; i++) {
      let prod = produtos[i];
      let qtd = 0;

      for (let j = 0; j < estoque.length; j++) {
        if (estoque[j].CodProduto === prod.CodProduto) {
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
    res.status(503).json({ erro: 'servidor de estoque fora do ar' });
  }
});


app.get('/pedidos', function (req, res) {
  res.json(pedidos);
});


app.post('/pedidos', async function (req, res) {
  let dados = req.body;


  if (typeof dados.NomeCliente !== 'string' || dados.NomeCliente.trim() == '') {
    return res.status(400).json({ erro: 'informe o nome do cliente' });
  }

  
  if (Array.isArray(dados.Itens) == false || dados.Itens.length == 0) {
    return res.status(400).json({ erro: 'o pedido precisa ter pelo menos um item' });
  }

  let itensSalvar = [];

  for (let i = 0; i < dados.Itens.length; i++) {
    let item = dados.Itens[i];

    if (item === null || typeof item !== 'object') {
      return res.status(400).json({ erro: 'item invalido' });
    }

    // quantidade tem que ser numero inteiro maior que zero
    if (Number.isInteger(item.Qtd) == false || item.Qtd <= 0) {
      return res.status(400).json({ erro: 'quantidade invalida' });
    }

    // procura o produto
    let produto = null;
    for (let j = 0; j < produtos.length; j++) {
      if (produtos[j].CodProduto === item.CodProduto) {
        produto = produtos[j];
      }
    }

    if (produto === null) {
      return res.status(400).json({ erro: 'produto nao encontrado' });
    }

    // se o produto ja esta na lista, so soma a quantidade
    let jaTem = false;
    for (let k = 0; k < itensSalvar.length; k++) {
      if (itensSalvar[k].CodProduto === produto.CodProduto) {
        itensSalvar[k].Qtd = itensSalvar[k].Qtd + item.Qtd;
        jaTem = true;
      }
    }

    if (jaTem == false) {
      itensSalvar.push({
        CodProduto: produto.CodProduto,
        Nome: produto.Nome,
        Preco: produto.Preco,
        Qtd: item.Qtd
      });
    }
  }


  let total = 0;
  for (let i = 0; i < itensSalvar.length; i++) {
    total = total + itensSalvar[i].Preco * itensSalvar[i].Qtd;
  }
  total = Math.round(total * 100) / 100;

  // da baixa no servidor 3 antes de registrar o pedido
  try {
    let reqBaixa = await fetch(URL_ESTOQUE + '/baixa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itensSalvar)
    });

    let respBaixa = await reqBaixa.json();

    if (reqBaixa.ok == false) {
      return res.status(400).json({ erro: respBaixa.erro });
    }

    let ped = {
      Numero: proximoNumeroPedido,
      NomeCliente: dados.NomeCliente.trim(),
      Total: total,
      Itens: itensSalvar
    };

    pedidos.push(ped);
    proximoNumeroPedido++;

    res.json(ped);
  } catch (e) {
    res.status(503).json({ erro: 'servidor de estoque fora do ar' });
  }
});


app.post('/pedidos/:id/fechar', function (req, res) {
  let id = Number(req.params.id);

  if (Number.isInteger(id) == false) {
    return res.status(400).json({ erro: 'numero de pedido invalido' });
  }

  let pos = -1;

  for (let i = 0; i < pedidos.length; i++) {
    if (pedidos[i].Numero === id) {
      pos = i;
    }
  }

  if (pos == -1) {
    return res.status(404).json({ erro: 'pedido nao encontrado' });
  }

  pedidos.splice(pos, 1);
  res.json({ mensagem: 'pedido ' + id + ' fechado' });
});


app.use(function (erro, req, res, next) {
  res.status(400).json({ erro: 'JSON invalido' });
});

app.listen(3001, function () {
  console.log('Servidor 2 (pedidos) rodando em http://localhost:3001');
});
