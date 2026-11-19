-- D+Ideias: banco, tabela e usuário da aplicação. Rodar como root.

-- Garante que os acentos do arquivo cheguem certos, seja qual for o cliente.
SET NAMES utf8mb4;

-- unicode_ci: a busca ignora maiúsculas e acentos ("manutencao" encontra "Manutenção").
CREATE DATABASE IF NOT EXISTS dmais_ideias
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dmais_ideias;

CREATE TABLE IF NOT EXISTS ideias (
  -- O id é o número da ideia ("Ideia 12").
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,

  -- VARCHAR e não INT: o RE pode ter zero à esquerda (0587).
  re_autor VARCHAR(10) NOT NULL,

  -- VARCHAR(2000) e não TEXT: o limite da validação também vale no banco.
  o_que_melhorar  VARCHAR(2000) NOT NULL,
  como_feito_hoje VARCHAR(2000) NOT NULL,
  como_melhorar   VARCHAR(2000) NOT NULL,
  beneficio       VARCHAR(2000) NOT NULL,

  -- Data escrita na ficha, que pode ser semanas antes da digitação (criado_em).
  data_registro DATE NOT NULL,

  criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- NULL enquanto a ideia nunca foi editada.
  atualizado_em DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_ideias_re_autor (re_autor),

  -- "Data não futura" fica no backend: o MariaDB não aceita CURDATE() em CHECK.
  CONSTRAINT chk_ideias_re_autor CHECK (re_autor REGEXP '^[0-9]+$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Menor privilégio: sem DELETE (ideias não são excluídas) e sem DROP ou ALTER.
-- '%' é necessário no Docker. Em produção, restringir ao IP da API e trocar a senha.
CREATE USER IF NOT EXISTS 'dmais_app'@'%' IDENTIFIED BY 'dmais_dev_123';
GRANT SELECT, INSERT, UPDATE ON dmais_ideias.* TO 'dmais_app'@'%';
