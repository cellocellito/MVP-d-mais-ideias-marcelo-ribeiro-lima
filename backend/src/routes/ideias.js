import { Router } from 'express';
import pool from '../db.js';
import { validarIdeia } from '../validacao.js';

// Valores sempre como parâmetro (?): o pool.execute() manda SQL e dados separados.
// O AS converte o snake_case do banco para o camelCase do JSON.

const router = Router();

// Até 10 dígitos: o tamanho de um INT UNSIGNED.
function idValido(texto) {
  return /^[1-9][0-9]{0,9}$/.test(texto);
}

function temErros(erros) {
  return Object.keys(erros).length > 0;
}

async function buscarIdeiaPorId(id) {
  const [linhas] = await pool.execute(
    `SELECT id,
            re_autor        AS reAutor,
            o_que_melhorar  AS oQueMelhorar,
            como_feito_hoje AS comoFeitoHoje,
            como_melhorar   AS comoMelhorar,
            beneficio,
            data_registro   AS dataRegistro,
            criado_em       AS criadoEm,
            atualizado_em   AS atualizadoEm
       FROM ideias
      WHERE id = ?`,
    [id]
  );
  return linhas[0];
}

// A listagem traz só as colunas que a tabela da tela mostra.

async function listarTodas() {
  const [linhas] = await pool.execute(
    `SELECT id, re_autor AS reAutor, o_que_melhorar AS oQueMelhorar, data_registro AS dataRegistro
       FROM ideias
      ORDER BY id DESC`
  );
  return linhas;
}

// Usa o índice idx_ideias_re_autor.
async function listarPorRe(re) {
  const [linhas] = await pool.execute(
    `SELECT id, re_autor AS reAutor, o_que_melhorar AS oQueMelhorar, data_registro AS dataRegistro
       FROM ideias
      WHERE re_autor = ?
      ORDER BY id DESC`,
    [re]
  );
  return linhas;
}

// Os % vão no valor do parâmetro, não no SQL.
async function listarPorTexto(texto) {
  const [linhas] = await pool.execute(
    `SELECT id, re_autor AS reAutor, o_que_melhorar AS oQueMelhorar, data_registro AS dataRegistro
       FROM ideias
      WHERE o_que_melhorar LIKE ?
      ORDER BY id DESC`,
    ['%' + texto + '%']
  );
  return linhas;
}

// GET /api/ideias?busca=
// Só números: busca o RE exato. Com letras: busca no texto de "O que pode ser melhorado".
router.get('/', async (req, res) => {
  let busca = '';
  if (typeof req.query.busca === 'string') {
    busca = req.query.busca.trim();
  }

  let ideias;
  if (busca === '') {
    ideias = await listarTodas();
  } else if (/^[0-9]+$/.test(busca)) {
    ideias = await listarPorRe(busca);
  } else {
    ideias = await listarPorTexto(busca);
  }

  res.json(ideias);
});

// GET /api/ideias/:id
router.get('/:id', async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ mensagem: 'O id deve ser um número inteiro positivo.' });
  }

  const ideia = await buscarIdeiaPorId(Number(req.params.id));
  if (!ideia) {
    return res.status(404).json({ mensagem: 'Ideia não encontrada.' });
  }

  res.json(ideia);
});

// POST /api/ideias
router.post('/', async (req, res) => {
  const { ideia, erros } = validarIdeia(req.body);
  if (temErros(erros)) {
    return res.status(400).json({ erros });
  }

  const [resultado] = await pool.execute(
    `INSERT INTO ideias
       (re_autor, o_que_melhorar, como_feito_hoje, como_melhorar, beneficio, data_registro)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      ideia.reAutor,
      ideia.oQueMelhorar,
      ideia.comoFeitoHoje,
      ideia.comoMelhorar,
      ideia.beneficio,
      ideia.dataRegistro,
    ]
  );

  const ideiaCriada = await buscarIdeiaPorId(resultado.insertId);
  res.status(201).location(`/api/ideias/${ideiaCriada.id}`).json(ideiaCriada);
});

// PUT /api/ideias/:id
router.put('/:id', async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ mensagem: 'O id deve ser um número inteiro positivo.' });
  }
  const id = Number(req.params.id);

  const { ideia, erros } = validarIdeia(req.body);
  if (temErros(erros)) {
    return res.status(400).json({ erros });
  }

  // O atualizado_em é preenchido pelo ON UPDATE da tabela.
  const [resultado] = await pool.execute(
    `UPDATE ideias
        SET re_autor = ?,
            o_que_melhorar = ?,
            como_feito_hoje = ?,
            como_melhorar = ?,
            beneficio = ?,
            data_registro = ?
      WHERE id = ?`,
    [
      ideia.reAutor,
      ideia.oQueMelhorar,
      ideia.comoFeitoHoje,
      ideia.comoMelhorar,
      ideia.beneficio,
      ideia.dataRegistro,
      id,
    ]
  );

  // Com FOUND_ROWS (padrão do mysql2), affectedRows conta as linhas encontradas,
  // mesmo sem mudança. Zero quer dizer que o id não existe.
  if (resultado.affectedRows === 0) {
    return res.status(404).json({ mensagem: 'Ideia não encontrada.' });
  }

  const ideiaAtualizada = await buscarIdeiaPorId(id);
  res.json(ideiaAtualizada);
});

export default router;
