import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CAMPOS_DE_TEXTO, ROTULOS, TAMANHO_MAXIMO_RE, TAMANHO_MAXIMO_TEXTO } from '../campos.js';
import { dataDeHoje } from '../datas.js';
import { validarIdeia } from '../validacao.js';

// Ordem dos campos na tela, igual à ficha de papel.
const ORDEM_DOS_CAMPOS = ['reAutor', ...CAMPOS_DE_TEXTO, 'dataRegistro'];

// Coloca o cursor no primeiro campo com erro, para o usuário ir direto nele.
function focarPrimeiroErro(erros) {
  const primeiroCampo = ORDEM_DOS_CAMPOS.find((campo) => erros[campo]);
  if (primeiroCampo) {
    document.getElementById(`campo-${primeiroCampo}`).focus();
  }
}

// Formulário da ficha, usado no cadastro (NovaIdeia) e na edição (EditarIdeia).
// - valoresIniciais: os 6 campos da ficha (vazios no cadastro, preenchidos na edição);
// - textoDoBotao: "Cadastrar ideia" ou "Salvar alterações";
// - destinoCancelar: para onde o botão Cancelar leva;
// - aoSalvar(dados): função da página que chama a API e muda de tela.
//   Se ela lançar um erro, o formulário mostra a mensagem e libera o botão.
export default function FormularioIdeia({ valoresIniciais, textoDoBotao, destinoCancelar, aoSalvar }) {
  const [valores, setValores] = useState(valoresIniciais);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Um único onChange para todos os campos: o "name" do campo diz qual valor mudar.
  function alterarCampo(evento) {
    const campo = evento.target.name;
    setValores({ ...valores, [campo]: evento.target.value });

    // O erro do campo some assim que o usuário começa a corrigir.
    if (erros[campo]) {
      setErros({ ...erros, [campo]: null });
    }
  }

  async function enviar(evento) {
    evento.preventDefault();

    // A mesma limpeza que o backend faz: tira os espaços das pontas.
    const dados = {
      reAutor: valores.reAutor.trim(),
      oQueMelhorar: valores.oQueMelhorar.trim(),
      comoFeitoHoje: valores.comoFeitoHoje.trim(),
      comoMelhorar: valores.comoMelhorar.trim(),
      beneficio: valores.beneficio.trim(),
      dataRegistro: valores.dataRegistro.trim(),
    };

    const errosEncontrados = validarIdeia(dados);
    if (Object.keys(errosEncontrados).length > 0) {
      setErros(errosEncontrados);
      setErroGeral('Confira os campos destacados.');
      focarPrimeiroErro(errosEncontrados);
      return;
    }

    setErros({});
    setErroGeral(null);
    setEnviando(true);
    try {
      await aoSalvar(dados);
    } catch (erroDaApi) {
      // Erro 400 do backend: mostra a mensagem embaixo de cada campo.
      if (erroDaApi.erros) {
        setErros(erroDaApi.erros);
        focarPrimeiroErro(erroDaApi.erros);
      }
      setErroGeral(erroDaApi.message);
      setEnviando(false);
    }
  }

  // noValidate: desliga os balões de erro do navegador. As mensagens
  // aparecem embaixo de cada campo, sempre no mesmo formato.
  return (
    <form className="cartao formulario" onSubmit={enviar} noValidate>
      <div className="campo">
        <label htmlFor="campo-reAutor">{ROTULOS.reAutor}</label>
        <p className="dica" id="dica-reAutor">
          Só números, como está na ficha.
        </p>
        {/* type="text" e não "number": número perderia o zero à esquerda (0587). */}
        <input
          id="campo-reAutor"
          name="reAutor"
          className="campo-curto"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={TAMANHO_MAXIMO_RE}
          value={valores.reAutor}
          onChange={alterarCampo}
          aria-invalid={Boolean(erros.reAutor)}
          aria-describedby="dica-reAutor erro-reAutor"
        />
        {erros.reAutor && (
          <p className="rodape-campo mensagem-erro" id="erro-reAutor">
            {erros.reAutor}
          </p>
        )}
      </div>

      {CAMPOS_DE_TEXTO.map((campo) => (
        <div className="campo" key={campo}>
          <label htmlFor={`campo-${campo}`}>{ROTULOS[campo]}</label>
          <textarea
            id={`campo-${campo}`}
            name={campo}
            rows={4}
            maxLength={TAMANHO_MAXIMO_TEXTO}
            value={valores[campo]}
            onChange={alterarCampo}
            aria-invalid={Boolean(erros[campo])}
            aria-describedby={`erro-${campo} contador-${campo}`}
          />
          <div className="rodape-campo">
            {erros[campo] && (
              <p className="mensagem-erro" id={`erro-${campo}`}>
                {erros[campo]}
              </p>
            )}
            <p className="contador" id={`contador-${campo}`}>
              {valores[campo].length} / {TAMANHO_MAXIMO_TEXTO}
            </p>
          </div>
        </div>
      ))}

      <div className="campo">
        <label htmlFor="campo-dataRegistro">{ROTULOS.dataRegistro}</label>
        <p className="dica" id="dica-dataRegistro">
          A data escrita na ficha. Não pode ser no futuro.
        </p>
        <input
          id="campo-dataRegistro"
          name="dataRegistro"
          className="campo-curto"
          type="date"
          max={dataDeHoje()}
          value={valores.dataRegistro}
          onChange={alterarCampo}
          aria-invalid={Boolean(erros.dataRegistro)}
          aria-describedby="dica-dataRegistro erro-dataRegistro"
        />
        {erros.dataRegistro && (
          <p className="rodape-campo mensagem-erro" id="erro-dataRegistro">
            {erros.dataRegistro}
          </p>
        )}
      </div>

      <div className="acoes-formulario">
        {erroGeral && (
          <p className="aviso aviso-erro" role="alert">
            {erroGeral}
          </p>
        )}
        <div className="acoes">
          <button type="submit" className="botao" disabled={enviando}>
            {enviando ? 'Salvando...' : textoDoBotao}
          </button>
          <Link className="botao botao-secundario" to={destinoCancelar}>
            Cancelar
          </Link>
        </div>
      </div>
    </form>
  );
}
