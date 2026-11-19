import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  // Datas como texto ("2026-08-05"). Sem isso, o mysql2 cria um Date com fuso
  // horário, e a tela pode mostrar o dia anterior.
  dateStrings: true,
});

export default pool;
