
const URL_API = 'http://localhost:3001';

function mostrarErro(mensagem) {
  document.getElementById('erro').textContent = mensagem;
}

function mostrarSucesso(mensagem) {
  document.getElementById('sucesso').textContent = mensagem;
}


async function carregarProdutos() {
  try {
    let resposta = await fetch(URL_API + '/produtos');
    let dados = await resposta.json();

    if (resposta.ok == false) {
      mostrarErro(dados.erro);
      return;
    }

   
    let guardados = {};
    let camposAntigos = document.getElementsByClassName('campoQtd');
    for (let i = 0; i < camposAntigos.length; i++) {
      guardados[camposAntigos[i].dataset.codigo] = camposAntigos[i].value;
    }

    let corpoTabela = document.getElementById('listaProdutos');
    corpoTabela.innerHTML = '';

    for (let i = 0; i < dados.length; i++) {
      let produto = dados[i];
      let linha = document.createElement('tr');

      let campos = [
        produto.CodProduto,
        produto.Nome,
        'R$ ' + produto.Preco.toFixed(2),
        produto.Estoque
      ];

      
      for (let j = 0; j < campos.length; j++) {
        let celula = document.createElement('td');
        celula.textContent = campos[j];
        linha.appendChild(celula);
      }

      let celulaQtd = document.createElement('td');
      let campoQtd = document.createElement('input');
      campoQtd.type = 'number';
      campoQtd.min = '0';
      campoQtd.value = '0';
      campoQtd.className = 'campoQtd';
      campoQtd.dataset.codigo = produto.CodProduto;

      if (guardados[produto.CodProduto] !== undefined) {
        campoQtd.value = guardados[produto.CodProduto];
      }

      celulaQtd.appendChild(campoQtd);
      linha.appendChild(celulaQtd);

      corpoTabela.appendChild(linha);
    }
  } catch (erro) {
    mostrarErro('Não foi possível conectar ao servidor de pedidos.');
  }
}

// botao "Atualizar cardapio"
function atualizarCardapio() {
  mostrarErro('');
  mostrarSucesso('');
  carregarProdutos();
}


async function enviarPedido() {
  mostrarErro('');
  mostrarSucesso('');

  let nome = document.getElementById('nomeCliente').value.trim();
  let campos = document.getElementsByClassName('campoQtd');
  let itens = [];

  for (let i = 0; i < campos.length; i++) {
    let qtd = parseInt(campos[i].value);
    if (qtd > 0) {
      itens.push({
        CodProduto: parseInt(campos[i].dataset.codigo),
        Qtd: qtd
      });
    }
  }


  if (nome == '') {
    mostrarErro('Digite o nome do cliente.');
    return;
  }

  if (itens.length == 0) {
    mostrarErro('Escolha a quantidade de pelo menos um produto.');
    return;
  }

  let pedido = {
    NomeCliente: nome,
    Itens: itens
  };

 
  let botao = document.getElementById('botaoEnviar');
  botao.disabled = true;

  try {
    let resposta = await fetch(URL_API + '/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedido)
    });
    let dados = await resposta.json();

    if (resposta.ok == false) {
      mostrarErro(dados.erro);
      carregarProdutos(); 
    } else {
      mostrarSucesso('Pedido nº ' + dados.Numero + ' registrado com sucesso!');
      document.getElementById('nomeCliente').value = '';

      // zera as quantidades
      for (let i = 0; i < campos.length; i++) {
        campos[i].value = '0';
      }
      carregarProdutos();
    }
  } catch (erro) {
    mostrarErro('Não foi possível conectar ao servidor de pedidos.');
  }

  botao.disabled = false;
}

carregarProdutos();
