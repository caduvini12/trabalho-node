const URL_API = 'http://localhost:3001';

let mostrarErro = (mensagem) => {
  document.getElementById('erro').textContent = mensagem;
}

let mostrarSucesso = (mensagem) => {
  document.getElementById('sucesso').textContent = mensagem;
}

// carrega os produtos e monta a tabela
async function carregarProdutos() {
  try {
    let resposta = await fetch(`${URL_API}/produtos`);
    let dados = await resposta.json();

    if (resposta.ok == false) {
      mostrarErro(dados.erro);
      return;
    }

    let tbody = document.getElementById('listaProdutos');
    let linhas = '';

    for (let i = 0; i < dados.length; i++) {
      let p = dados[i];
      linhas += `<tr>
        <td>${p.CodProduto}</td>
        <td>${p.Nome}</td>
        <td>R$ ${p.Preco.toFixed(2)}</td>
        <td>${p.Estoque}</td>
        <td><input type="number" min="0" value="0" class="campoQtd" data-codigo="${p.CodProduto}"></td>
      </tr>`;
    }

    tbody.innerHTML = linhas;
  } catch (erro) {
    mostrarErro('erro ao buscar produtos');
  }
}

// pega os itens marcados e manda pro servidor 2
async function enviarPedido() {
  mostrarErro('');
  mostrarSucesso('');

  let nome = document.getElementById('nomeCliente').value;
  let campos = document.getElementsByClassName('campoQtd');
  let itensLista = [];

  for (let i = 0; i < campos.length; i++) {
    let qtd = parseInt(campos[i].value);
    if (qtd > 0) {
      itensLista.push({
        CodProduto: parseInt(campos[i].dataset.codigo),
        Qtd: qtd
      });
    }
  }

  let ped = {
    NomeCliente: nome,
    Itens: itensLista
  };

  try {
    let req = await fetch(`${URL_API}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ped)
    });

    let dadosPed = await req.json();

    if (req.ok == false) {
      mostrarErro(dadosPed.erro);
      return;
    }

    mostrarSucesso(`Pedido ${dadosPed.Numero} feito com sucesso!`);
    document.getElementById('nomeCliente').value = '';
    carregarProdutos();
  } catch (erro) {
    mostrarErro('erro ao enviar');
  }
}

carregarProdutos();