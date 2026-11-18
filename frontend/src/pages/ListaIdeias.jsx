import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { listarIdeias } from '../api.js';
import { formatarData } from '../datas.js';
import MensagemDeErro from '../components/MensagemDeErro.jsx';

// "1 ideia cadastrada", "8 ideias cadastradas", "2 ideias encontradas para “1043”"
function textoDoResumo(quantidade, busca) {
  if (quantidade === 1) {
    return busca ? `1 ideia encontrada para “${busca}”` : '1 ideia cadastrada';
  }
  return busca
    ? `${quantidade} ideias encontradas para “${busca}”`
    : `${quantidade} ideias cadastradas`;
}

export default function ListaIdeias() {
  const navigate = useNavigate();

  // A busca aplicada fica na URL (/?busca=1043). Assim o F5 e o botão
  // Voltar do navegador mantêm o filtro.
  const [parametros, setParametros] = useSearchParams();
  const busca = parametros.get('busca') || '';

  // O que está digitado no campo (só vira busca ao clicar em Buscar).
  const [textoBusca, setTextoBusca] = useState(busca);

  const [ideias, setIdeias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  // Se a busca da URL mudar (Voltar do navegador, Limpar), o campo acompanha.
  useEffect(() => {
    setTextoBusca(busca);
  }, [busca]);

  // Carrega a lista sempre que a busca muda ou o usuário clica em "Tentar de novo".
  useEffect(() => {
    // Se a busca mudar antes desta resposta chegar, ela é descartada,
    // para uma resposta antiga não sobrescrever a nova.
    let ignorarResposta = false;

    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const lista = await listarIdeias(busca);
        if (!ignorarResposta) {
          setIdeias(lista);
        }
      } catch (erroDaApi) {
        if (!ignorarResposta) {
          setErro(erroDaApi.message);
        }
      } finally {
        if (!ignorarResposta) {
          setCarregando(false);
        }
      }
    }

    carregar();
    return () => {
      ignorarResposta = true;
    };
  }, [busca, tentativa]);

  function aoBuscar(evento) {
    evento.preventDefault();
    const termo = textoBusca.trim();
    if (termo === '') {
      setParametros({});
    } else {
      setParametros({ busca: termo });
    }
  }

  function limparBusca() {
    setParametros({});
  }

  let conteudo;
  if (carregando) {
    conteudo = (
      <p className="estado" role="status">
        Carregando ideias...
      </p>
    );
  } else if (erro) {
    conteudo = (
      <MensagemDeErro
        titulo="Não foi possível carregar as ideias."
        mensagem={erro}
        aoTentarDeNovo={() => setTentativa(tentativa + 1)}
      />
    );
  } else if (ideias.length === 0 && busca) {
    conteudo = (
      <div className="estado">
        <p className="estado-titulo">Nenhuma ideia encontrada para “{busca}”.</p>
        <button type="button" className="botao botao-secundario" onClick={limparBusca}>
          Limpar busca
        </button>
      </div>
    );
  } else if (ideias.length === 0) {
    conteudo = (
      <div className="estado">
        <p className="estado-titulo">Nenhuma ideia cadastrada ainda.</p>
        <Link className="botao" to="/ideias/nova">
          Cadastrar a primeira ideia
        </Link>
      </div>
    );
  } else {
    conteudo = (
      <>
        <p className="resumo">{textoDoResumo(ideias.length, busca)}</p>
        <div className="tabela-container">
          <table className="tabela">
            <thead>
              <tr>
                <th scope="col">Nº</th>
                <th scope="col">RE</th>
                <th scope="col">O que pode ser melhorado</th>
                <th scope="col">Data de registro</th>
              </tr>
            </thead>
            <tbody>
              {ideias.map((ideia) => (
                // A linha inteira é clicável para quem usa o mouse.
                // O link no número é para quem navega pelo teclado.
                <tr key={ideia.id} onClick={() => navigate(`/ideias/${ideia.id}`)}>
                  <td>
                    {/* stopPropagation: o link já navega, a linha não precisa navegar de novo. */}
                    <Link to={`/ideias/${ideia.id}`} onClick={(evento) => evento.stopPropagation()}>
                      Ideia {ideia.id}
                    </Link>
                  </td>
                  <td className="numero">{ideia.reAutor}</td>
                  <td className="coluna-texto" title={ideia.oQueMelhorar}>
                    {ideia.oQueMelhorar}
                  </td>
                  <td className="numero">{formatarData(ideia.dataRegistro)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  return (
    <>
      <title>Ideias | D+Ideias</title>

      <div className="topo-pagina">
        <h1>Ideias</h1>
        <Link className="botao" to="/ideias/nova">
          Nova ideia
        </Link>
      </div>

      <form className="busca" role="search" onSubmit={aoBuscar}>
        <div className="busca-campo">
          <label htmlFor="busca">Buscar</label>
          <p className="dica" id="busca-dica">
            Só números: busca pelo RE. Com letras: busca em “O que pode ser melhorado”.
          </p>
          <input
            id="busca"
            type="search"
            placeholder="Ex.: 1043 ou molde"
            value={textoBusca}
            onChange={(evento) => setTextoBusca(evento.target.value)}
            aria-describedby="busca-dica"
          />
        </div>
        <button type="submit" className="botao botao-secundario">
          Buscar
        </button>
        {busca && (
          <button type="button" className="botao botao-secundario" onClick={limparBusca}>
            Limpar busca
          </button>
        )}
      </form>

      {conteudo}
    </>
  );
}
