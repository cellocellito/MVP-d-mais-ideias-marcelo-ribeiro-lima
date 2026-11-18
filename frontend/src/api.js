// Chamadas à API. Todas usam caminho relativo (/api/...): em desenvolvimento,
// o Vite repassa essas chamadas para o backend (ver vite.config.js).

// Lê o corpo da resposta como JSON. Devolve null se o corpo não for JSON
// (por exemplo, quando o backend está desligado e o Vite responde com erro).
async function lerJson(resposta) {
  try {
    return await resposta.json();
  } catch {
    return null;
  }
}

// Faz a chamada e devolve o JSON da resposta.
// Se a API responder com erro, lança um Error com:
// - message: texto para mostrar na tela;
// - status: código HTTP (404, 500...);
// - erros: { campo: 'mensagem' } quando é erro de validação (400).
async function chamarApi(caminho, opcoes) {
  let resposta;
  try {
    resposta = await fetch(caminho, opcoes);
  } catch {
    throw new Error('Não foi possível falar com o servidor. Confira se a API está rodando.');
  }

  const corpo = await lerJson(resposta);
  if (resposta.ok) {
    return corpo;
  }

  let mensagem = 'Não foi possível falar com o servidor. Tente novamente.';
  if (corpo && corpo.mensagem) {
    mensagem = corpo.mensagem;
  } else if (corpo && corpo.erros) {
    mensagem = 'Confira os campos destacados.';
  }

  const erro = new Error(mensagem);
  erro.status = resposta.status;
  erro.erros = corpo && corpo.erros ? corpo.erros : null;
  throw erro;
}

export function listarIdeias(busca) {
  // encodeURIComponent evita que caracteres como & ou # quebrem a URL.
  return chamarApi('/api/ideias?busca=' + encodeURIComponent(busca));
}

export function buscarIdeia(id) {
  return chamarApi('/api/ideias/' + encodeURIComponent(id));
}

export function cadastrarIdeia(dados) {
  return chamarApi('/api/ideias', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
}

export function atualizarIdeia(id, dados) {
  return chamarApi('/api/ideias/' + encodeURIComponent(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
}
