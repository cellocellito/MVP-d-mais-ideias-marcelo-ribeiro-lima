// Validação do POST e do PUT. O frontend repete estas regras, mas a fonte da verdade é aqui.

const TAMANHO_MINIMO_TEXTO = 5;
const TAMANHO_MAXIMO_TEXTO = 2000;

const CAMPOS_DE_TEXTO = ['oQueMelhorar', 'comoFeitoHoje', 'comoMelhorar', 'beneficio'];

// Número, null ou objeto viram texto vazio e caem em "campo obrigatório".
function limparTexto(valor) {
  if (typeof valor !== 'string') {
    return '';
  }
  return valor.trim();
}

// Não usa toISOString(): ela converte para UTC e, no Brasil,
// depois das 21h já devolve a data de amanhã.
function dataDeHoje() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

// O Date "conserta" datas impossíveis (30/02 vira 02/03), por isso a conferência.
function dataExiste(texto) {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(texto)) {
    return false;
  }
  const partes = texto.split('-');
  const ano = Number(partes[0]);
  const mes = Number(partes[1]);
  const dia = Number(partes[2]);
  const data = new Date(ano, mes - 1, dia);
  return data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;
}

function validarTexto(texto) {
  if (texto === '') {
    return 'Preencha este campo.';
  }
  if (texto.length < TAMANHO_MINIMO_TEXTO) {
    return `Escreva pelo menos ${TAMANHO_MINIMO_TEXTO} caracteres.`;
  }
  if (texto.length > TAMANHO_MAXIMO_TEXTO) {
    return `Use no máximo ${TAMANHO_MAXIMO_TEXTO} caracteres.`;
  }
  return null;
}

// Devolve só os 6 campos da ficha (id ou criadoEm enviados são ignorados) e os erros por campo.
export function validarIdeia(corpo) {
  const dados = corpo || {};

  const ideia = {
    reAutor: limparTexto(dados.reAutor),
    oQueMelhorar: limparTexto(dados.oQueMelhorar),
    comoFeitoHoje: limparTexto(dados.comoFeitoHoje),
    comoMelhorar: limparTexto(dados.comoMelhorar),
    beneficio: limparTexto(dados.beneficio),
    dataRegistro: limparTexto(dados.dataRegistro),
  };

  const erros = {};

  if (ideia.reAutor === '') {
    erros.reAutor = 'Informe o RE do autor.';
  } else if (!/^[0-9]{1,10}$/.test(ideia.reAutor)) {
    erros.reAutor = 'O RE deve ter só números, com no máximo 10 dígitos.';
  }

  for (const campo of CAMPOS_DE_TEXTO) {
    const erro = validarTexto(ideia[campo]);
    if (erro) {
      erros[campo] = erro;
    }
  }

  // Em AAAA-MM-DD, comparar as datas como texto funciona.
  if (ideia.dataRegistro === '') {
    erros.dataRegistro = 'Informe a data de registro.';
  } else if (!dataExiste(ideia.dataRegistro)) {
    erros.dataRegistro = 'Data inválida.';
  } else if (ideia.dataRegistro > dataDeHoje()) {
    erros.dataRegistro = 'A data de registro não pode ser no futuro.';
  }

  return { ideia, erros };
}
