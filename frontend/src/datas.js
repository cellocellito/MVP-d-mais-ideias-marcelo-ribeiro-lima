// A API devolve datas como texto: "2026-08-05" (DATE) e "2026-09-02 08:40:00"
// (DATETIME). A formatação é feita direto no texto, sem new Date(): o Date lê
// "2026-08-05" como meia-noite em UTC, e no Brasil isso vira 04/08 às 21h.

// "2026-08-05" -> "05/08/2026"
export function formatarData(texto) {
  const [ano, mes, dia] = texto.split('-');
  return `${dia}/${mes}/${ano}`;
}

// "2026-09-02 08:40:00" -> "02/09/2026 às 08:40"
export function formatarDataHora(texto) {
  const [data, hora] = texto.split(' ');
  return `${formatarData(data)} às ${hora.slice(0, 5)}`;
}

// Data de hoje no fuso do computador, no formato AAAA-MM-DD (o mesmo do
// <input type="date">). Não usa toISOString(), porque ela converte para UTC:
// no Brasil, depois das 21h, já devolveria a data de amanhã.
export function dataDeHoje() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}
