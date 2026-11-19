import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { atualizarIdeia, buscarIdeia } from '../api.js';
import FormularioIdeia from '../components/FormularioIdeia.jsx';
import MensagemDeErro from '../components/MensagemDeErro.jsx';

// Carrega a ideia e abre o mesmo formulário do cadastro, já preenchido.
export default function EditarIdeia() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ideia, setIdeia] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
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

  async function salvar(dados) {
    // Nenhum campo mudou: não chama a API. Assim a tela não diz "atualizada"
    // para uma ideia que continua igual (e que o banco não marca como editada).
    const nadaMudou = Object.keys(dados).every((campo) => dados[campo] === ideia[campo]);
    if (nadaMudou) {
      navigate(`/ideias/${ideia.id}`, {
        replace: true,
        state: { aviso: 'Nenhuma alteração para salvar.' },
      });
      return;
    }

    const ideiaAtualizada = await atualizarIdeia(id, dados);
    // replace: o formulário de edição sai do histórico do navegador.
    navigate(`/ideias/${ideiaAtualizada.id}`, {
      replace: true,
      state: { aviso: `Ideia ${ideiaAtualizada.id} atualizada.` },
    });
  }

  if (carregando) {
    return (
      <p className="estado" role="status">
        Carregando ideia...
      </p>
    );
  }

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

  // Só os 6 campos da ficha vão para o formulário (sem id e datas de auditoria).
  const valoresIniciais = {
    reAutor: ideia.reAutor,
    oQueMelhorar: ideia.oQueMelhorar,
    comoFeitoHoje: ideia.comoFeitoHoje,
    comoMelhorar: ideia.comoMelhorar,
    beneficio: ideia.beneficio,
    dataRegistro: ideia.dataRegistro,
  };

  return (
    <>
      <title>{`Editar ideia ${ideia.id} | D+Ideias`}</title>
      <div className="topo-pagina">
        <div>
          <h1>Editar ideia {ideia.id}</h1>
          <p className="subtitulo">Corrija os dados digitados. O número da ideia não muda.</p>
        </div>
      </div>
      <FormularioIdeia
        valoresIniciais={valoresIniciais}
        textoDoBotao="Salvar alterações"
        destinoCancelar={`/ideias/${ideia.id}`}
        aoSalvar={salvar}
      />
    </>
  );
}
