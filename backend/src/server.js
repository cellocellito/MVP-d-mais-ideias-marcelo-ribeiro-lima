import express from 'express';
import helmet from 'helmet';
import pool from './db.js';
import ideiasRouter from './routes/ideias.js';

const app = express();

// Adiciona cabeçalhos HTTP de segurança: impede que a página seja aberta
// dentro de um iframe de outro site, que o navegador "adivinhe" o tipo de um
// arquivo, etc. Também remove o cabeçalho que conta que o servidor é Express.
app.use(helmet());

// Lê o corpo JSON das requisições. O limite impede que alguém mande um corpo
// gigante para ocupar a memória do servidor. Uma ficha completa tem bem menos
// de 100 KB (4 textos de até 2000 caracteres).
app.use(express.json({ limit: '100kb' }));

app.use('/api/ideias', ideiasRouter);

// Nenhuma rota atendeu.
app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada.' });
});

// Tratamento de erros. No Express 5, um erro dentro de uma rota async
// chega aqui sozinho, sem precisar de try/catch em cada rota.
// O detalhe do erro vai só para o console do servidor. O cliente recebe uma
// mensagem genérica: stack trace e erro do banco revelam como o sistema é
// por dentro (nomes de tabela, versões, caminhos).
// O "next" não é usado, mas precisa estar aqui: o Express só reconhece
// uma função de tratamento de erro quando ela tem os 4 parâmetros.
app.use((erro, req, res, next) => {
  // Erros do express.json(): o problema está no que o cliente enviou.
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ mensagem: 'O corpo da requisição não é um JSON válido.' });
  }
  if (erro.type === 'entity.too.large') {
    return res.status(413).json({ mensagem: 'O corpo da requisição passou do limite de 100 KB.' });
  }

  console.error(erro);
  res.status(500).json({ mensagem: 'Erro interno no servidor. Tente novamente.' });
});

// Testa a conexão antes de subir a API. Se o banco não responder,
// para logo com uma mensagem clara, em vez de falhar na primeira requisição.
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
