// Caixa de erro de carregamento, com botão para tentar de novo.
// Usada na listagem, no detalhe e na edição.
export default function MensagemDeErro({ titulo, mensagem, aoTentarDeNovo }) {
  return (
    <div className="estado estado-erro" role="alert">
      <p className="estado-titulo">{titulo}</p>
      <p>{mensagem}</p>
      <button type="button" className="botao botao-secundario" onClick={aoTentarDeNovo}>
        Tentar de novo
      </button>
    </div>
  );
}
