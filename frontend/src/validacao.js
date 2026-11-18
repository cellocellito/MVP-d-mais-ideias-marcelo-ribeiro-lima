// Mesmas regras de backend/src/validacao.js, com as mesmas mensagens.
// Aqui servem só para avisar o usuário na hora, sem esperar a API.
// Quem garante os dados é o backend: ele valida de novo tudo o que chega.
import { dataDeHoje } from './datas.js';
import { CAMPOS_DE_TEXTO, TAMANHO_MINIMO_TEXTO, TAMANHO_MAXIMO_TEXTO } from './campos.js';

// Confere se a data existe no calendário (30/02 não existe).
// O Date "conserta" datas impossíveis (30/02 vira 02/03), então basta ver
// se o ano, o mês e o dia continuaram os mesmos.
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

// Recebe os valores do formulário (já sem espaços nas pontas)
// e devolve { campo: 'mensagem' }. Objeto vazio = tudo certo.
export function validarIdeia(valores) {
  const erros = {};

  if (valores.reAutor === '') {
    erros.reAutor = 'Informe o RE do autor.';
  } else if (!/^[0-9]{1,10}$/.test(valores.reAutor)) {
    erros.reAutor = 'O RE deve ter só números, com no máximo 10 dígitos.';
  }

  for (const campo of CAMPOS_DE_TEXTO) {
    const erro = validarTexto(valores[campo]);
    if (erro) {
      erros[campo] = erro;
    }
  }

  // No formato AAAA-MM-DD, comparar as datas como texto funciona.
  if (valores.dataRegistro === '') {
    erros.dataRegistro = 'Informe a data de registro.';
  } else if (!dataExiste(valores.dataRegistro)) {
    erros.dataRegistro = 'Data inválida.';
  } else if (valores.dataRegistro > dataDeHoje()) {
    erros.dataRegistro = 'A data de registro não pode ser no futuro.';
  }

  return erros;
}
