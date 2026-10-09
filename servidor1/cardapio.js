// Script da pagina do cardapio.
// Fala somente com o Servidor 2 (porta 3001).

const URL_API = 'http://localhost:3001';

function mostrarErro(mensagem) {
  document.getElementById('erro').textContent = mensagem;
}

function mostrarSucesso(mensagem) {
  document.getElementById('sucesso').textContent = mensagem;
}

function limparMensagens() {
  mostrarErro('');
  mostrarSucesso('');
}

async function carregarProdutos() {
  try {
    const resposta = await fetch(URL_API + '/produtos');
    const dados = await resposta.json();

    if (!resposta.ok) {
      mostrarErro(dados.erro);
      return;
    }

    const corpoTabela = document.getElementById('listaProdutos');
    corpoTabela.innerHTML = '';

    for (let i = 0; i < dados.length; i++) {
      const produto = dados[i];
      const linha = document.createElement('tr');

      const campos = [
        produto.CodProduto,
        produto.Nome,
        'R$ ' + produto.Preco.toFixed(2),
        produto.Estoque
      ];

      for (let j = 0; j < campos.length; j++) {
        const celula = document.createElement('td');
        celula.textContent = campos[j];
        linha.appendChild(celula);
      }

      const celulaQuantidade = document.createElement('td');
      const campoQuantidade = document.createElement('input');
      campoQuantidade.type = 'number';
      campoQuantidade.min = '0';
      campoQuantidade.value = '0';
      campoQuantidade.className = 'campoQtd';
      campoQuantidade.dataset.codigo = produto.CodProduto;
      celulaQuantidade.appendChild(campoQuantidade);
      linha.appendChild(celulaQuantidade);

      corpoTabela.appendChild(linha);
    }
  } catch (erro) {
    mostrarErro('Não foi possível conectar ao servidor de pedidos.');
  }
}

async function enviarPedido() {
  limparMensagens();

  const nomeCliente = document.getElementById('nomeCliente').value;
  const campos = document.getElementsByClassName('campoQtd');
  const itens = [];

  for (let i = 0; i < campos.length; i++) {
    const quantidade = parseInt(campos[i].value);
    if (quantidade > 0) {
      itens.push({
        CodProduto: parseInt(campos[i].dataset.codigo),
        Qtd: quantidade
      });
    }
  }

  const pedido = {
    NomeCliente: nomeCliente,
    Itens: itens
  };

  try {
    const resposta = await fetch(URL_API + '/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedido)
    });
    const dados = await resposta.json();

    if (!resposta.ok) {
      mostrarErro(dados.erro);
      return;
    }

    mostrarSucesso('Pedido nº ' + dados.Numero + ' registrado com sucesso!');
    document.getElementById('nomeCliente').value = '';
    carregarProdutos();
  } catch (erro) {
    mostrarErro('Não foi possível conectar ao servidor de pedidos.');
  }
}

carregarProdutos();