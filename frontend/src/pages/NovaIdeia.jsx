import { useNavigate } from 'react-router-dom';
import { cadastrarIdeia } from '../api.js';
import { dataDeHoje } from '../datas.js';
import FormularioIdeia from '../components/FormularioIdeia.jsx';

export default function NovaIdeia() {
  const navigate = useNavigate();

  const valoresIniciais = {
    reAutor: '',
    oQueMelhorar: '',
    comoFeitoHoje: '',
    comoMelhorar: '',
    beneficio: '',
    dataRegistro: dataDeHoje(),
  };

  async function salvar(dados) {
    const ideiaCriada = await cadastrarIdeia(dados);
    // replace: o Voltar do navegador não reabre um formulário já enviado.
    navigate(`/ideias/${ideiaCriada.id}`, {
      replace: true,
      state: { aviso: `Ideia ${ideiaCriada.id} cadastrada.` },
    });
  }

  return (
    <>
      <title>Nova ideia | D+Ideias</title>
      <div className="topo-pagina">
        <div>
          <h1>Nova ideia</h1>
          <p className="subtitulo">Digite os dados como estão na ficha de papel.</p>
        </div>
      </div>
      <FormularioIdeia
        valoresIniciais={valoresIniciais}
        textoDoBotao="Cadastrar ideia"
        destinoCancelar="/"
        aoSalvar={salvar}
      />
    </>
  );
}
