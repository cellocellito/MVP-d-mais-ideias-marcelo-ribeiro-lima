import mysql from 'mysql2/promise';

// Pool: um conjunto de conexões que ficam abertas e são reaproveitadas pelas
// requisições, em vez de abrir e fechar uma conexão nova a cada chamada.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,

  // Devolve DATE e DATETIME como texto ("2026-08-05"), igual está no banco.
  // Sem isso, o mysql2 cria um objeto Date do JavaScript, que aplica fuso
  // horário: 2026-08-05 vira 2026-08-05T03:00:00Z e a tela pode mostrar 04/08.
  dateStrings: true,
});

export default pool;
