import express from 'express';
import helmet from 'helmet';
import pool from './db.js';
import ideiasRouter from './routes/ideias.js';

const app = express();

app.use(helmet());
// Uma ficha completa tem poucos KB. O limite barra corpos gigantes.
app.use(express.json({ limit: '100kb' }));

app.use('/api/ideias', ideiasRouter);

app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada.' });
});

// No Express 5, erros de rotas async chegam aqui sozinhos.
// O detalhe vai só para o console: stack trace e erro do banco expõem o sistema por dentro.
// O "next" não é usado, mas o Express só reconhece o tratamento de erro com 4 parâmetros.
app.use((erro, req, res, next) => {
  // JSON inválido ou grande demais: o erro é de quem enviou, não do servidor.
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ mensagem: 'O corpo da requisição não é um JSON válido.' });
  }
  if (erro.type === 'entity.too.large') {
    return res.status(413).json({ mensagem: 'O corpo da requisição passou do limite de 100 KB.' });
  }

  console.error(erro);
  res.status(500).json({ mensagem: 'Erro interno no servidor. Tente novamente.' });
});

// Se o banco não responder, para já com uma mensagem clara.
try {
  await pool.query('SELECT 1');
} catch (erro) {
  console.error('Não foi possível conectar ao banco de dados. Confira o backend/.env.');
  console.error(erro.message);
  process.exit(1);
}

const porta = Number(process.env.PORT) || 3000;

app.listen(porta, (erro) => {
  if (erro) {
    console.error(`Não foi possível usar a porta ${porta}: ${erro.message}`);
    process.exit(1);
  }
  console.log(`API do D+Ideias rodando em http://localhost:${porta}`);
});
