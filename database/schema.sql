-- D+Ideias: criação do banco, da tabela e do usuário da aplicação.
-- Rodar como root (precisa de permissão para criar banco e usuário).

-- Garante que os acentos deste arquivo chegam certos ao servidor,
-- seja qual for o padrão do cliente (HeidiSQL, linha de comando ou Docker).
SET NAMES utf8mb4;

-- utf8mb4: guarda qualquer caractere (acentos, símbolos).
-- utf8mb4_unicode_ci: comparações ignoram maiúscula e acento,
-- então a busca por "manutencao" encontra "Manutenção".
CREATE DATABASE IF NOT EXISTS dmais_ideias
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dmais_ideias;

CREATE TABLE IF NOT EXISTS ideias (
  -- O id é o próprio número da ideia ("Ideia 1", "Ideia 2"...).
  -- AUTO_INCREMENT faz o banco gerar o número, único e em sequência.
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,

  -- VARCHAR e não INT: o RE pode ter zero à esquerda (0587)
  -- e ninguém faz conta com ele. É um identificador, não uma quantidade.
  re_autor VARCHAR(10) NOT NULL,

  -- VARCHAR(2000) e não TEXT: o limite de 2000 caracteres da validação
  -- também fica garantido aqui no banco.
  o_que_melhorar  VARCHAR(2000) NOT NULL,
  como_feito_hoje VARCHAR(2000) NOT NULL,
  como_melhorar   VARCHAR(2000) NOT NULL,
  beneficio       VARCHAR(2000) NOT NULL,

  -- Data escrita na ficha de papel. Pode ser semanas antes da digitação.
  data_registro DATE NOT NULL,

  -- Auditoria: quando a ficha foi digitada no sistema
  -- e quando foi editada pela última vez (NULL = nunca editada).
  -- O ON UPDATE é do próprio banco: vale até para edição feita fora da aplicação.
  criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  -- Usado pela busca por RE (WHERE re_autor = ?).
  INDEX idx_ideias_re_autor (re_autor),

  -- A regra "RE só tem dígitos" também vale para quem inserir direto no banco.
  -- A regra "data não futura" não pode ficar aqui: o MariaDB não aceita
  -- CURDATE() em CHECK, porque o resultado muda com o passar dos dias.
  -- Ela fica na validação do backend.
  CONSTRAINT chk_ideias_re_autor CHECK (re_autor REGEXP '^[0-9]+$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Usuário que a aplicação usa para se conectar ao banco.
--
-- Princípio do menor privilégio: só SELECT, INSERT e UPDATE, e só neste banco.
--   - Sem DELETE: o sistema não exclui ideias, de propósito.
--   - Sem DROP, ALTER ou CREATE: se alguém conseguir controlar a aplicação,
--     não consegue apagar a tabela nem mudar a estrutura do banco.
--
-- '%' aceita conexão de qualquer máquina. É necessário no Docker, onde a
-- conexão chega pelo IP da rede do Docker e não por localhost.
-- Em produção, trocar '%' pelo IP do servidor da API.
--
-- A senha é de desenvolvimento (a mesma de backend/.env.example).
-- Em produção, trocar por uma senha forte.
CREATE USER IF NOT EXISTS 'dmais_app'@'%' IDENTIFIED BY 'dmais_dev_123';
GRANT SELECT, INSERT, UPDATE ON dmais_ideias.* TO 'dmais_app'@'%';
