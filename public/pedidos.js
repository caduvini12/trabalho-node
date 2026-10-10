const URL_API = 'http://localhost:3001';

let mostrarErro = (msg) => {
  document.getElementById('erro').innerText = msg;
}

// busca pedidos em aberto
async function carregarPedidos() {
  mostrarErro('');
  try {
    let req = await fetch(`${URL_API}/pedidos`);
    let lista = await req.json();

    if (req.ok == false) {
      mostrarErro(lista.erro);
      return;
    }

    let div = document.getElementById('listaPedidos');

    if (lista.length == 0) {
      div.innerHTML = 'Nenhum pedido aberto.';
      return;
    }

    let html = '';
    for (let i = 0; i < lista.length; i++) {
      let ped = lista[i];
      let itensHtml = '';

      for (let j = 0; j < ped.Itens.length; j++) {
        let item = ped.Itens[j];
        itensHtml += `
          <tr>
            <td>${item.CodProduto}</td>
            <td>${item.Nome}</td>
            <td>R$ ${item.Preco.toFixed(2)}</td>
            <td>${item.Qtd}</td>
          </tr>`;
      }

      html += `
        <div class="pedido">
          <h3>Pedido nº ${ped.Numero} - ${ped.NomeCliente}</h3>
          <table>
            <tr>
              <th>Código</th>
              <th>Produto</th>
              <th>Preço</th>
              <th>Quantidade</th>
            </tr>
            ${itensHtml}
          </table>
          <p>Total do pedido: R$ ${ped.Total.toFixed(2)}</p>
          <button onclick="fecharPedido(${ped.Numero})">Fechar pedido</button>
        </div>`;
    }

    div.innerHTML = html;
  } catch (e) {
    mostrarErro('erro ao buscar pedidos');
  }
}

// fecha o pedido e atualiza a lista
async function fecharPedido(num) {
  try {
    let req = await fetch(`${URL_API}/pedidos/${num}/fechar`, {
      method: 'POST'
    });
    let dados = await req.json();

    if (req.ok == false) {
      mostrarErro(dados.erro);
      return;
    }

    carregarPedidos();
  } catch (e) {
    mostrarErro('erro ao fechar');
  }
}

carregarPedidos();
