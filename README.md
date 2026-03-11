# Guia do Participante — iLab2026

Site estático + servidor Express com enquete interativa para o **Security Day**.

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 22 LTS |
| pnpm | 10 |

## Instalação local

```bash
# Clone o repositório
git clone https://github.com/vileganhon-sourc/Guia-do-Participante---Ilab2026.git
cd Guia-do-Participante---Ilab2026

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env

# Inicie em modo desenvolvimento (hot-reload)
pnpm run dev        # ou:  node_modules/.bin/tsx server/index.ts
```

O app ficará disponível em **http://localhost:5000**.

---

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `5000` | Porta do servidor |
| `NODE_ENV` | `development` | `development` ou `production` |
| `MAX_VOTES` | `27` | Limite de votos por empresa |
| `MAX_SELECTIONS` | `8` | Seleções por usuário |
| `RATE_LIMIT_MS` | `60000` | Janela de rate limit (ms) |
| `VOTE_FILE` | `server/votes.json` | Caminho do arquivo de persistência |

---

## Build de Produção

```bash
pnpm run build   # Compila cliente (Vite) + servidor (esbuild) → /dist
pnpm run start   # Serve o build em modo production
```

---

## Deploy

### 🐳 Docker (recomendado)

```bash
# Build da imagem
docker build -t ilab2026 .

# Execução com volume persistente para os votos
docker run -d \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e MAX_VOTES=27 \
  -v ilab2026_votes:/app/dist/votes.json \
  ilab2026
```

> **Importante:** use sempre o volume `-v` para que os votos persistam entre redeploys.

### ☁️ Vercel / Railway / Render

> ⚠️ Estes providers são **stateless** — o arquivo `votes.json` é redefinido a cada deploy.
> Para produção real com persistência, prefira **Docker** ou substitua o `votes.json` por um banco de dados (ex.: Turso/SQLite edge, Upstash Redis).

Para provar conceito num deploy rápido:

1. Importe o repositório no painel do provider.
2. Defina as variáveis de ambiente acima em "Environment Variables".
3. **Build command:** `pnpm run build`
4. **Start command:** `node dist/index.js`

---

## Arquitetura resumida

```
.
├── client/          # React + Vite (front-end)
│   └── src/
│       ├── components/SecurityDayPoll.tsx  ← Enquete interativa
│       └── pages/Home.tsx
├── server/
│   └── index.ts     ← Express + API /api/poll (mutex + rate limit)
├── .env.example
├── Dockerfile
└── package.json
```

### API da Enquete

| Endpoint | Método | Descrição |
|---|---|---|
| `/api/poll` | `GET` | Retorna as 31 empresas com contagem de votos |
| `/api/poll` | `POST` | Registra 8 seleções (valida duplicatas, limite e race condition) |

#### Regras de negócio

- Cada usuário vota em exatamente **8** empresas.
- Cada empresa aceita no máximo **27** votos.
- Rate limit: **1 voto por IP a cada 60 s**.
- Race condition protegida por **mutex** em memória.
