# D+Ideias

MVP do programa **D+Ideias**, da Gestão da Qualidade. Hoje os colaboradores escrevem ideias de melhoria numa ficha de papel, e uma vez por mês o setor de avaliação digita as fichas numa planilha. Este sistema substitui a planilha: o avaliador da Qualidade cadastra cada ficha, e cada ideia recebe um número único e sequencial (Ideia 1, Ideia 2…).

## Funcionalidades

- **Listagem** de todas as ideias, da mais nova para a mais antiga, com busca por RE do autor ou pelo texto de "O que pode ser melhorado".
- **Detalhe** de uma ideia, com os campos da ficha.
- **Cadastro** de uma nova ideia, com validação de cada campo.
- **Edição** de uma ideia, para corrigir erros de digitação.

Não há exclusão, de propósito: apagar uma ideia criaria um buraco na numeração e perderia o registro do programa. Erro de digitação se corrige editando.

## Entregáveis

| Entregável | Onde |
|---|---|
| DER | [docs/der.md](docs/der.md) (Mermaid, com a explicação dos campos) e [docs/der.png](docs/der.png) |
| SQL de criação do banco | [database/schema.sql](database/schema.sql) e as ideias de exemplo em [database/seed.sql](database/seed.sql) |
| Código-fonte | [backend/](backend/) (API) e [frontend/](frontend/) (telas) |
| Instruções de execução | Este arquivo |
| Decisões técnicas e testes | [Decisões principais](#decisões-principais) e [Testando a API](#testando-a-api), neste arquivo |

Feito com apoio de IA.

## Tecnologias

| Parte | Tecnologia |
|---|---|
| Banco | MariaDB 12.3, SQL puro (sem ORM) |
| Backend | Node.js, Express 5, `mysql2` (queries parametrizadas), `helmet` |
| Frontend | React 19, Vite 8, React Router 7, CSS puro |

## Pré-requisitos

- **Node.js 22.12+ ou 24** (LTS). O Vite 8 exige no mínimo Node 20.19 ou 22.12. O npm vem junto com o Node.
- **Um banco**, de um destes dois jeitos:
  - **Docker Desktop** (caminho A, mais simples), ou
  - **MariaDB instalado na máquina** (caminho B). Testado no MariaDB 12.3.

Confira as versões:

```bash
node -v
npm -v
docker --version
```

## Como rodar

São três partes: banco, backend e frontend. O backend e o frontend rodam cada um no seu terminal.

### 1. Banco de dados

#### Caminho A: com Docker

Na pasta raiz do projeto:

```bash
docker compose up -d --wait
```

Isso sobe um MariaDB 12.3 na porta **3307** (para não conflitar com um MariaDB local na 3306). Na primeira vez, ele roda sozinho o `schema.sql` e o `seed.sql`: o banco já nasce com a tabela, o usuário da aplicação e 8 ideias de exemplo. O comando só libera o terminal quando o banco está pronto.

O `backend/.env.example` já vem com `DB_PORT=3307`, a porta do Docker. No passo 2, não precisa mudar nada.

Para apagar tudo e começar de novo (os scripts rodam outra vez):

```bash
docker compose down -v
docker compose up -d --wait
```

#### Caminho B: MariaDB instalado na máquina

Rode os dois scripts **como root** (ou outro usuário que possa criar banco e usuário), nesta ordem: primeiro o `schema.sql`, depois o `seed.sql`.

**Pelo HeidiSQL:** conecte como root, abra *Arquivo > Carregar arquivo SQL* (em inglês, *File > Load SQL file*), escolha `database/schema.sql` e execute (F9). Repita com `database/seed.sql`.

**Pela linha de comando**, na pasta raiz do projeto:

- Linux, macOS, Git Bash ou cmd:

  ```bash
  mariadb -u root -p < database/schema.sql
  mariadb -u root -p < database/seed.sql
  ```

- PowerShell (que não tem o `<`). Se o `mariadb` não estiver no PATH, use o caminho completo, por exemplo `& "C:\Program Files\MariaDB 12.3\bin\mariadb.exe"`:

  ```powershell
  mariadb -u root -p -e "source database/schema.sql"
  mariadb -u root -p -e "source database/seed.sql"
  ```

O `schema.sql` cria:
- o banco `dmais_ideias`;
- a tabela `ideias`;
- o usuário `dmais_app` (senha de desenvolvimento `dmais_dev_123`), que só tem `SELECT`, `INSERT` e `UPDATE`.

O seed deve rodar uma vez só: rodar de novo duplica as ideias de exemplo.

No passo 2, troque `DB_PORT=3307` por `DB_PORT=3306` no `backend/.env`.

### 2. Backend (API)

Em um terminal, na pasta raiz do projeto:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

No cmd do Windows, troque `cp` por `copy`. Se o banco for o MariaDB instalado na máquina (caminho B), abra o `.env` e troque `DB_PORT=3307` por `DB_PORT=3306` antes do `npm run dev`.

Deve aparecer:

```
API do D+Ideias rodando em http://localhost:3000
```

Se aparecer `Não foi possível conectar ao banco de dados`, o banco não está rodando ou o `.env` está com a porta errada.

O `npm run dev` reinicia a API sozinho quando um arquivo muda. Para rodar sem isso, use `npm start`.

### 3. Frontend (telas)

Em **outro** terminal, na pasta raiz do projeto:

```bash
cd frontend
npm install
npm run dev
```

Abra **http://localhost:5173**. O Vite repassa as chamadas `/api` para o backend na porta 3000, então a API precisa estar rodando.

#### Build de produção (opcional)

```bash
npm run build
npm run preview
```

O `build` gera os arquivos finais em `frontend/dist`. O `preview` serve esse build em http://localhost:4173, com o mesmo repasse do `/api` para o backend.

## Variáveis de ambiente

Ficam em `backend/.env`, que não vai para o git. O modelo é o [backend/.env.example](backend/.env.example).

| Variável | Padrão | O que é |
|---|---|---|
| `PORT` | `3000` | Porta da API. Se mudar, ajuste também o proxy em `frontend/vite.config.js`. |
| `DB_HOST` | `127.0.0.1` | Endereço do MariaDB. |
| `DB_PORT` | `3307` | Porta do MariaDB. `3307` é a do Docker. Use `3306` com o MariaDB instalado na máquina. |
| `DB_USER` | `dmais_app` | Usuário da aplicação, criado no `schema.sql`. |
| `DB_PASSWORD` | `dmais_dev_123` | Senha de desenvolvimento, a mesma do `schema.sql`. Em produção, trocar nos dois lugares. |
| `DB_NAME` | `dmais_ideias` | Nome do banco. |

## API

| Método | Rota | Resposta |
|---|---|---|
| `GET` | `/api/ideias?busca=` | 200 + lista (mais nova primeiro). A busca é opcional: só números procura o RE exato, com letras procura em "O que pode ser melhorado". |
| `GET` | `/api/ideias/:id` | 200 + ideia. 404 se não existir. 400 se o id não for inteiro positivo. |
| `POST` | `/api/ideias` | 201 + ideia criada. 400 + `{ "erros": { "campo": "mensagem" } }` se a ficha for inválida. |
| `PUT` | `/api/ideias/:id` | 200 + ideia atualizada. 400 se for inválida, 404 se não existir. |

Corpo do `POST` e do `PUT`:

```json
{
  "reAutor": "1043",
  "oQueMelhorar": "Tempo de troca de molde nas injetoras",
  "comoFeitoHoje": "O operador busca as ferramentas no almoxarifado depois que a máquina para.",
  "comoMelhorar": "Montar um carrinho de setup para cada injetora.",
  "beneficio": "Menos tempo de máquina parada.",
  "dataRegistro": "2026-08-05"
}
```

Regras: todos os campos são obrigatórios. O RE tem só números (até 10 dígitos), cada texto tem de 5 a 2000 caracteres e a data precisa existir e não pode ser futura. Erro inesperado devolve 500 com uma mensagem genérica, sem detalhes internos.

## Testando a API

Com a API rodando, na pasta raiz do projeto. No PowerShell, use `curl.exe` no lugar de `curl` (lá, `curl` é outro comando).

```bash
# Listar todas e buscar pelo RE
curl -i http://localhost:3000/api/ideias
curl -i "http://localhost:3000/api/ideias?busca=1043"

# Detalhe (200) e ideia que não existe (404)
curl -i http://localhost:3000/api/ideias/5
curl -i http://localhost:3000/api/ideias/999

# Cadastro válido (201)
curl -i -X POST http://localhost:3000/api/ideias -H "Content-Type: application/json" --data-binary "@docs/requisicoes/ideia-valida.json"

# SQL injection num campo de texto: é salvo como texto comum (201), e a tabela continua existindo
curl -i -X POST http://localhost:3000/api/ideias -H "Content-Type: application/json" --data-binary "@docs/requisicoes/ideia-sql-injection.json"

# Campos inválidos: 400 com o erro de cada campo
curl -i -X POST http://localhost:3000/api/ideias -H "Content-Type: application/json" --data-binary "@docs/requisicoes/ideia-campos-invalidos.json"

# Edição (200)
curl -i -X PUT http://localhost:3000/api/ideias/1 -H "Content-Type: application/json" --data-binary "@docs/requisicoes/ideia-editada.json"
```

Outros casos (corpo vazio, data futura, campos extras como `id`) estão em [docs/requisicoes/](docs/requisicoes/). Os testes criam ideias novas. Para voltar às 8 de exemplo no Docker, use `docker compose down -v` e depois `docker compose up -d --wait`.

## Estrutura do projeto

```
.
├── database/
│   ├── schema.sql          # banco, tabela e usuário da aplicação
│   └── seed.sql            # 8 ideias de exemplo
├── backend/
│   ├── .env.example        # modelo das variáveis de ambiente
│   └── src/
│       ├── server.js       # Express, middlewares, rotas e tratamento de erro
│       ├── db.js           # pool de conexões com o MariaDB
│       ├── validacao.js    # regras de cada campo da ficha
│       └── routes/
│           └── ideias.js   # as 4 rotas e o SQL de cada uma
├── frontend/
│   ├── vite.config.js      # proxy /api -> backend
│   └── src/
│       ├── main.jsx, App.jsx
│       ├── api.js          # chamadas à API
│       ├── campos.js       # rótulos da ficha e limites
│       ├── validacao.js    # mesmas regras do backend
│       ├── datas.js        # formatação de datas
│       ├── styles.css
│       ├── pages/          # ListaIdeias, DetalheIdeia, NovaIdeia, EditarIdeia
│       └── components/     # FormularioIdeia, MensagemDeErro
├── docs/
│   ├── der.md, der.png     # DER
│   └── requisicoes/        # corpos JSON usados nos testes com curl
└── docker-compose.yml      # opcional: só o MariaDB, na porta 3307
```

## Decisões principais

### Banco

- **SQL puro, sem ORM.** Com o SQL escrito à mão, dá para ver exatamente o que roda no banco e testar cada consulta no HeidiSQL.
- **O `id` é o número da ideia.** O `AUTO_INCREMENT` gera o número no banco, então duas ideias nunca recebem o mesmo, mesmo com dois cadastros ao mesmo tempo.
- **RE como `VARCHAR(10)`, e não `INT`.** É um identificador, não uma quantidade, e o `0587` não pode virar `587`.
- **Regras repetidas no banco:** `NOT NULL`, `VARCHAR(2000)` nos textos e um `CHECK` que só aceita dígitos no RE. A regra "data não futura" fica só no backend, porque o MariaDB não aceita `CURDATE()` dentro de um `CHECK`.
- **Duas datas:** `data_registro` (a escrita na ficha) e `criado_em` (quando a ficha foi digitada). O `atualizado_em` é preenchido pelo próprio banco quando a ideia é editada.
- **Índice em `re_autor`**, usado na busca por RE (`WHERE re_autor = ?`).

Os detalhes de cada campo estão no [DER](docs/der.md).

### API

- **O backend é a fonte da verdade.** Ele valida tudo o que chega. O frontend repete as mesmas regras só para avisar o usuário mais rápido.
- **Só os 6 campos da ficha entram no `INSERT` e no `UPDATE`.** Um `id` ou um `criadoEm` enviado no corpo é ignorado.
- **Datas como texto (`dateStrings: true`).** Sem isso, o mysql2 converte a data para `Date` com fuso horário, e `2026-08-05` pode aparecer como 04/08.
- **Busca:** só números procura o RE exato (e usa o índice). Com letras, procura com `LIKE` no texto de "O que pode ser melhorado". A collation `utf8mb4_unicode_ci` faz a busca ignorar maiúsculas e acentos.

### Frontend

- **Proxy do Vite em vez de CORS.** O navegador só fala com `localhost:5173`, e o Vite repassa o `/api` para o backend.
- **O mesmo formulário para cadastrar e editar**, com erro embaixo de cada campo, contador de caracteres e foco no primeiro campo com erro.
- **A busca fica na URL** (`/?busca=1043`), então o F5 e o Voltar do navegador mantêm o filtro.

## Segurança

- Todas as consultas usam parâmetros (`?`). Nenhum SQL é montado juntando texto digitado.
- O backend valida tudo o que chega, sem depender do frontend.
- A aplicação usa um usuário de banco com privilégio mínimo: sem `DELETE`, `DROP` ou `ALTER`.
- `helmet()` adiciona cabeçalhos de segurança, e o JSON recebido é limitado a 100 KB.
- Erro 500 não expõe stack trace nem mensagem do banco.
- As credenciais ficam só no `.env`, que está no `.gitignore`.
- O React escapa todo texto exibido. O projeto não usa `dangerouslySetInnerHTML`.
- Não há CORS aberto: o frontend fala com a API pelo proxy do Vite.

## Fora do escopo

- **Login.** O MVP tem um único perfil de usuário (o avaliador da Qualidade) e roda na rede interna. Numa versão real, o caminho é integrar com o login corporativo da empresa (AD/SSO), e não criar um cadastro de senhas próprio.
- **Exclusão.** Fica de fora de propósito, para proteger a numeração e a rastreabilidade. O usuário do banco nem tem permissão de `DELETE`.
- **Cadastro de colaboradores.** O RE é um campo simples, como definido no case.
- **Status de avaliação, testes automatizados e deploy.**

### Próximos passos

1. Login integrado ao AD/SSO da empresa, com perfis (avaliador, gestor, consulta).
2. Tabela de colaboradores, com o RE virando chave estrangeira.
3. Status e avaliação da ideia (em análise, aprovada, recusada, implantada), com parecer.
4. Histórico de alterações: quem editou o quê e quando.
5. Filtro por período de registro e paginação.
6. Testes automatizados da validação e das rotas da API.
7. Exportação para Excel/CSV.

## Problemas comuns

**`Não foi possível conectar ao banco de dados`.** O banco não está rodando, ou o `DB_PORT` do `.env` não bate com ele (3306 local, 3307 Docker).

**`Access denied for user 'dmais_app'`.** O `schema.sql` não foi executado, ou a senha do `.env` é diferente da do `schema.sql`.

**`Access denied for user ''@'localhost'`.** Algumas instalações antigas do MariaDB têm um usuário anônimo que "rouba" as conexões locais. Remova esse usuário como root (`DROP USER ''@'localhost';`), ou peça ajuda a quem administra o banco.

**A porta 3307 já está em uso.** Troque o lado esquerdo de `"3307:3306"` no `docker-compose.yml` (por exemplo, `"3308:3306"`) e use a mesma porta no `DB_PORT`.

**Mudei o `schema.sql` e o Docker não aplicou.** Os scripts só rodam quando o volume é criado. Use `docker compose down -v` e depois `docker compose up -d --wait`.

**Acentos trocados no terminal do PowerShell (`peÃ§as`).** É só a exibição. Rode `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` antes dos comandos.
