import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { buscarIdeia } from '../api.js';
import { CAMPOS_DE_TEXTO, ROTULOS } from '../campos.js';
import { formatarData, formatarDataHora } from '../datas.js';
import MensagemDeErro from '../components/MensagemDeErro.jsx';

export default function DetalheIdeia() {
  const { id } = useParams();

  const location = useLocation();
  const navigate = useNavigate();

  // Guardado no estado para continuar na tela depois da limpeza abaixo.
  const [aviso] = useState(location.state?.aviso);

  const [ideia, setIdeia] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  // Tira o aviso do histórico, para ele não voltar no F5.
  useEffect(() => {
    if (location.state?.aviso) {
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    // Descarta a resposta se o id mudar antes dela chegar.
    let ignorarResposta = false;

    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const ideiaEncontrada = await buscarIdeia(id);
        if (!ignorarResposta) {
          setIdeia(ideiaEncontrada);
        }
      } catch (erroDaApi) {
        if (!ignorarResposta) {
          setErro(erroDaApi);
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
  }, [id, tentativa]);

  if (carregando) {
    return (
      <p className="estado" role="status">
        Carregando ideia...
      </p>
    );
  }

  // 404: o número não existe. 400: o endereço não tem um número válido (/ideias/abc).
  if (erro && (erro.status === 404 || erro.status === 400)) {
    return (
      <div className="estado">
        <title>Ideia não encontrada | D+Ideias</title>
        <p className="estado-titulo">Ideia não encontrada.</p>
        <p>Confira o número da ideia no endereço da página.</p>
        <Link className="botao botao-secundario" to="/">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  if (erro) {
    return (
      <MensagemDeErro
        titulo="Não foi possível carregar a ideia."
        mensagem={erro.message}
        aoTentarDeNovo={() => setTentativa(tentativa + 1)}
      />
    );
  }

  return (
    <>
      <title>{`Ideia ${ideia.id} | D+Ideias`}</title>

      {aviso && (
        <p className="aviso aviso-sucesso" role="status">
          {aviso}
        </p>
      )}

      <div className="topo-pagina">
        <h1>Ideia {ideia.id}</h1>
        <div className="acoes">
          <Link className="botao botao-secundario" to="/">
            Voltar
          </Link>
          <Link className="botao" to={`/ideias/${ideia.id}/editar`}>
            Editar
          </Link>
        </div>
      </div>

      <article className="cartao">
        <dl className="metadados">
          <div>
            <dt>{ROTULOS.reAutor}</dt>
            <dd className="numero">{ideia.reAutor}</dd>
          </div>
          <div>
            <dt>Data de registro</dt>
            <dd className="numero">{formatarData(ideia.dataRegistro)}</dd>
          </div>
          <div>
            <dt>Cadastrada em</dt>
            <dd className="numero">{formatarDataHora(ideia.criadoEm)}</dd>
          </div>
          {ideia.atualizadoEm && (
            <div>
              <dt>Editada em</dt>
              <dd className="numero">{formatarDataHora(ideia.atualizadoEm)}</dd>
            </div>
          )}
        </dl>

        {CAMPOS_DE_TEXTO.map((campo) => (
          <section className="secao-ficha" key={campo}>
            <h2>{ROTULOS[campo]}</h2>
            <p>{ideia[campo]}</p>
          </section>
        ))}
      </article>
    </>
  );
}
