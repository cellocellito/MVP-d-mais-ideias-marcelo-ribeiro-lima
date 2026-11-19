// Caminhos relativos (/api/...): o proxy do Vite repassa para o backend.

// Com o backend desligado, o Vite responde com erro sem corpo JSON.
async function lerJson(resposta) {
  try {
    return await resposta.json();
  } catch {
    return null;
  }
}

// Todo erro vira um Error com message (para a tela), status e erros (por campo, no 400).
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
