const URL_API = 'http://localhost:3001';
 
function mostrarErro(mensagem) {
  document.getElementById('erro').textContent = mensagem;
}
 
function montarPedido(pedido) {
  const caixa = document.createElement('div');
  caixa.className = 'pedido';
 
  const titulo = document.createElement('h3');
  titulo.textContent = 'Pedido nº ' + pedido.Numero + ' - ' + pedido.NomeCliente;
  caixa.appendChild(titulo);
 
  const tabela = document.createElement('table');
  tabela.innerHTML =
    '<tr><th>Código</th><th>Produto</th><th>Preço</th><th>Quantidade</th></tr>';
 
  for (let i = 0; i < pedido.Itens.length; i++) {
    const item = pedido.Itens[i];
    const linha = document.createElement('tr');
 
    const campos = [
      item.CodProduto,
      item.Nome,
      'R$ ' + item.Preco.toFixed(2),
      item.Qtd
    ];
 
    for (let j = 0; j < campos.length; j++) {
      const celula = document.createElement('td');
      celula.textContent = campos[j];
      linha.appendChild(celula);
    }
 
    tabela.appendChild(linha);
  }
  caixa.appendChild(tabela);
 
  const total = document.createElement('p');
  total.textContent = 'Total do pedido: R$ ' + pedido.Total.toFixed(2);
  caixa.appendChild(total);
 
  const botaoFechar = document.createElement('button');
  botaoFechar.textContent = 'Fechar pedido';
  botaoFechar.onclick = function () {
    fecharPedido(pedido.Numero);
  };
  caixa.appendChild(botaoFechar);
 
  return caixa;
}
 
async function carregarPedidos() {
  mostrarErro('');
 
  try {
    const resposta = await fetch(URL_API + '/pedidos');
    const dados = await resposta.json();
 
    if (!resposta.ok) {
      mostrarErro(dados.erro);
      return;
    }
 
    const divLista = document.getElementById('listaPedidos');
    divLista.innerHTML = '';
 
    if (dados.length === 0) {
      divLista.textContent = 'Nenhum pedido aberto.';
      return;
    }
 
    for (let i = 0; i < dados.length; i++) {
      divLista.appendChild(montarPedido(dados[i]));
    }
  } catch (erro) {
    mostrarErro('Não foi possível conectar ao servidor de pedidos.');
  }
}
 
async function fecharPedido(numero) {
  mostrarErro('');
 
  try {
    const resposta = await fetch(URL_API + '/pedidos/' + numero + '/fechar', {
      method: 'POST'
    });
    const dados = await resposta.json();
 
    if (!resposta.ok) {
      mostrarErro(dados.erro);
      return;
    }
 
    carregarPedidos();
  } catch (erro) {
    mostrarErro('Não foi possível conectar ao servidor de pedidos.');
  }
}
 
carregarPedidos();
