import { Link, NavLink, Route, Routes } from 'react-router-dom';
import ListaIdeias from './pages/ListaIdeias.jsx';
import DetalheIdeia from './pages/DetalheIdeia.jsx';
import NovaIdeia from './pages/NovaIdeia.jsx';
import EditarIdeia from './pages/EditarIdeia.jsx';

function PaginaNaoEncontrada() {
  return (
    <div className="estado">
      <title>Página não encontrada | D+Ideias</title>
      <p className="estado-titulo">Página não encontrada.</p>
      <Link className="botao botao-secundario" to="/">
        Ver a lista de ideias
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <>
      <header className="cabecalho">
        <div className="cabecalho-conteudo">
          <Link className="marca" to="/">
            <span className="marca-nome">D+Ideias</span>
            <span className="marca-setor">Gestão da Qualidade</span>
          </Link>
          <nav className="navegacao" aria-label="Principal">
            <NavLink to="/" end>
              Ideias
            </NavLink>
            <NavLink to="/ideias/nova">Nova ideia</NavLink>
          </nav>
        </div>
      </header>

      <main className="conteudo">
        <Routes>
          <Route path="/" element={<ListaIdeias />} />
          <Route path="/ideias/nova" element={<NovaIdeia />} />
          <Route path="/ideias/:id" element={<DetalheIdeia />} />
          <Route path="/ideias/:id/editar" element={<EditarIdeia />} />
          <Route path="*" element={<PaginaNaoEncontrada />} />
        </Routes>
      </main>
    </>
  );
}
