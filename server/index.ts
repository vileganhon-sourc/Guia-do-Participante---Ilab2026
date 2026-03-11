import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Global Error Handlers (Silent Crash Prevention) ──────────────────────────
process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[FATAL] Unhandled Rejection at:", promise, "reason:", reason);
});

// ── Config (override via env vars) ───────────────────────────────────────────
const PORT = Number(process.env.PORT) || 5000;
const MAX_VOTES = Number(process.env.MAX_VOTES) || 27;
const MAX_SELECTIONS = Number(process.env.MAX_SELECTIONS) || 8;
const RATE_LIMIT_MS = Number(process.env.RATE_LIMIT_MS) || 60_000;

// Production-ready data path
// Production-ready data path with write-check
const isProd = process.env.NODE_ENV === "production";
let VOTE_FILE = process.env.VOTE_FILE
  ? path.resolve(process.env.VOTE_FILE)
  : isProd
    ? path.resolve(process.cwd(), "data", "votes.json")
    : path.resolve(__dirname, "votes.json");

// ── Startup Persistence Check ────────────────────────────────────────────────
try {
  const dataDir = path.dirname(VOTE_FILE);
  if (!fs.existsSync(dataDir)) {
    console.log(`[BOOT] Attempting to create directory: ${dataDir}`);
    fs.mkdirSync(dataDir, { recursive: true });
  }
  // Test write permission
  fs.appendFileSync(VOTE_FILE, "");
} catch (e) {
  console.warn(`[BOOT] WARNING: Data directory not writable at ${VOTE_FILE}. Falling back to /tmp/votes.json`);
  VOTE_FILE = path.join("/tmp", "votes.json");
  try {
    fs.writeFileSync(VOTE_FILE, JSON.stringify({}, null, 2));
  } catch (err) {
    console.error(`[BOOT] FATAL: Persistence failed even in /tmp. Server may run with empty state.`);
  }
}

// ── Company master list ───────────────────────────────────────────────────────
const COMPANIES: readonly string[] = [
  "Techbiz", "Teltronic", "Valid", "Flash", "Funcional", "Aeromot", "Axon",
  "Berkana", "BGS", "Condor", "Glagio", "Helper", "Inspect", "Iron Fence",
  "Magnet", "Raytec", "Revo", "Smart Power", "VMI", "Digitro", "ADTech",
  "Motorola", "Protecta", "Ford", "Airbus", "Byrna", "Ulbrichts", "Clarian",
  "Hex360", "Montreal", "Actatec",
];
const COMPANY_SET = new Set(COMPANIES);

// ── Vote store (in-memory + JSON file) ───────────────────────────────────────
type VoteStore = Record<string, number>;

function loadVotes(): VoteStore {
  try {
    if (fs.existsSync(VOTE_FILE)) {
      return JSON.parse(fs.readFileSync(VOTE_FILE, "utf-8")) as VoteStore;
    }
  } catch {
    // Corrupted file — reset to zero
  }
  const initial: VoteStore = {};
  for (const c of COMPANIES) initial[c] = 0;
  return initial;
}

function saveVotes(votes: VoteStore): void {
  fs.writeFileSync(VOTE_FILE, JSON.stringify(votes, null, 2), "utf-8");
}

let voteStore: VoteStore = loadVotes();

// ── Mutex: prevents race conditions during concurrent vote writes ─────────────
let writeLock = false;

async function withLock<T>(fn: () => T | Promise<T>): Promise<T> {
  while (writeLock) {
    await new Promise((r) => setTimeout(r, 5));
  }
  writeLock = true;
  try {
    return await fn();
  } finally {
    writeLock = false;
  }
}

// ── Rate limiter (in-memory, per IP) ─────────────────────────────────────────
const rateLimitMap = new Map<string, number>();

function isRateLimited(ip: string): boolean {
  const last = rateLimitMap.get(ip) ?? 0;
  if (Date.now() - last < RATE_LIMIT_MS) return true;
  rateLimitMap.set(ip, Date.now());
  return false;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function buildCompanyList(store: VoteStore) {
  return COMPANIES.map((name) => ({
    name,
    votes: store[name] ?? 0,
    disabled: (store[name] ?? 0) >= MAX_VOTES,
  }));
}

// ── Server ───────────────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // ── API: GET /api/poll ───────────────────────────────────────────────────
  app.get("/api/poll", (_req, res) => {
    res.json({ companies: buildCompanyList(voteStore) });
  });

  // ── API: POST /api/poll ──────────────────────────────────────────────────
  app.post("/api/poll", async (req, res) => {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0] ?? req.ip ?? "unknown";

    if (isRateLimited(ip)) {
      return res.status(429).json({ error: "Você já votou recentemente. Aguarde alguns minutos." });
    }

    const { companies } = req.body as { companies?: unknown };

    if (!Array.isArray(companies) || companies.length !== MAX_SELECTIONS) {
      return res.status(400).json({ error: `Selecione exatamente ${MAX_SELECTIONS} empresas.` });
    }

    const names = companies as string[];

    const unknowns = names.filter((c) => !COMPANY_SET.has(c));
    if (unknowns.length > 0) {
      return res.status(400).json({ error: `Empresa(s) inválida(s): ${unknowns.join(", ")}` });
    }

    const hasDuplicates = new Set(names).size !== names.length;
    if (hasDuplicates) {
      return res.status(400).json({ error: "Seleções duplicadas não são permitidas." });
    }

    // Atomic write under mutex lock to prevent race conditions
    const result = await withLock(() => {
      const overCapacity = names.filter((c) => (voteStore[c] ?? 0) >= MAX_VOTES);
      if (overCapacity.length > 0) {
        return { error: `Vagas esgotadas: ${overCapacity.join(", ")}. Escolha outras empresas.` };
      }

      for (const c of names) {
        voteStore[c] = (voteStore[c] ?? 0) + 1;
      }
      saveVotes(voteStore);

      return { companies: buildCompanyList(voteStore) };
    });

    if ("error" in result) {
      return res.status(409).json(result);
    }

    return res.json({ ok: true, ...result });
  });

  // ── Mode & Path Resolution (v2.7 - Universal Cloud) ─────────────────────
  const isProduction = process.env.NODE_ENV === "production";
  const rootDir = process.cwd();

  // Port discovery for Cloud Platforms (Heroku, Render, Railay, Vercel)
  // Defaulting to 5000 to match Dockerfile EXPOSE
  const FINAL_PORT = Number(process.env.PORT) || 5000;

  const candidatePaths = [
    path.resolve(rootDir, "dist", "public"),
    path.resolve(__dirname, "public"),
    path.resolve(rootDir, "public"),
    path.resolve(rootDir, "client"),
  ];

  let staticPath = isProduction ? candidatePaths[0] : path.resolve(rootDir, "client");

  console.log(`\n************************************************`);
  console.log(`* [BOOT] SERVER v3.1 - DIAGNOSTIC MODE       *`);
  console.log(`* CWD: ${rootDir} | Port: ${FINAL_PORT}          *`);
  console.log(`************************************************\n`);

  if (isProduction) {
    console.log(`[BOOT] Auditing static file locations:`);
    for (const p of candidatePaths) {
      const exists = fs.existsSync(p);
      const hasIndex = exists && fs.existsSync(path.join(p, "index.html"));
      console.log(`  - ${p} => Exists: ${exists} | Has index.html: ${hasIndex}`);
      if (hasIndex) {
        staticPath = p;
        break;
      }
    }

    try {
      if (fs.existsSync(staticPath)) {
        console.log(`[BOOT] Files in staticPath (${staticPath}):`, fs.readdirSync(staticPath).join(", "));
      }
    } catch (e) {
      console.error(`[BOOT] Audit failed:`, e);
    }
  }

  // Request logger
  app.use((req, _res, next) => {
    console.log(`[v2.7] ${req.method} ${req.url} - ${req.ip}`);
    next();
  });

  // Diagnostic Endpoint
  app.get("/api/debug/system", (_req, res) => {
    res.json({
      version: "3.1",
      env: process.env.NODE_ENV,
      port: FINAL_PORT,
      cwd: process.cwd(),
      staticPath,
      exists: fs.existsSync(staticPath),
      files: fs.existsSync(staticPath) ? fs.readdirSync(staticPath) : [],
      envVars: {
        PORT: process.env.PORT,
        NODE_ENV: process.env.NODE_ENV,
      }
    });
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
      configFile: path.resolve(rootDir, "vite.config.ts"),
    });

    app.use(vite.middlewares);

    app.get("*", async (req, res, next) => {
      try {
        let template = fs.readFileSync(path.resolve(rootDir, "client", "index.html"), "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(staticPath, { maxAge: "1d" }));

    app.get("/health", (_req, res) => res.json({ status: "ok", v: "2.7" }));

    app.get("*", (req, res) => {
      const indexPath = path.join(staticPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error(`[v2.7 ERROR] File not found: ${indexPath}`);
        res.status(404).send(`Application Error (v2.7): Static assets missing. Please verify build output.`);
      }
    });
  }

  server.on("error", (e: any) => {
    console.error(`[v2.7 FATAL ERR] ${e.message}`);
    process.exit(1);
  });

  server.listen(FINAL_PORT, "0.0.0.0", () => {
    console.log(`\n[v3.1 READY] ==> Listening on http://0.0.0.0:${FINAL_PORT}\n`);
  });
}

startServer().catch(console.error);
