// api/poll.ts — Vercel Serverless Function for /api/poll
// Supports two independent groups via ?group=1 or ?group=2
import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";

const MAX_VOTES = Number(process.env.MAX_VOTES) || 27;
const MAX_SELECTIONS = Number(process.env.MAX_SELECTIONS) || 8;
const RATE_LIMIT_MS = Number(process.env.RATE_LIMIT_MS) || 60_000;

// Deadline: 2026-02-27 18:00:00 Brasília (UTC-3) = 21:00:00 UTC
const DEADLINE = new Date("2026-03-01T21:00:00.000Z");
const isVotingClosed = () => Date.now() >= DEADLINE.getTime();

const VALID_GROUPS = new Set([1, 2]);

const COMPANIES: readonly string[] = [
    "Actatec", "ADTech", "Aeromot", "Airbus", "Axon",
    "Berkana", "BGS", "Byrna", "Clarian", "Condor",
    "Digitro", "Flash", "Ford", "Funcional", "Glagio",
    "Helper", "Hex360", "Inspect", "Iron Fence", "Magnet",
    "Montreal", "Motorola", "Protecta", "Raytec", "Revo",
    "Smart Power", "Techbiz", "Teltronic", "Ulbrichts", "Valid", "VMI",
];
const COMPANY_SET = new Set(COMPANIES);

type VoteStore = Record<string, number>;

function voteFile(group: number): string {
    // 2.7 - Support persistent storage via env var
    const baseDir = process.env.PERSISTENT_STORAGE_DIR || "/tmp";
    return `${baseDir}/votes-group${group}.json`;
}

function loadVotes(group: number): VoteStore {
    const file = voteFile(group);
    try {
        if (fs.existsSync(file)) {
            const data = fs.readFileSync(file, "utf-8");
            return JSON.parse(data) as VoteStore;
        }
    } catch (e) {
        console.error(`[POLL] Failed to load votes for group ${group} from ${file}:`, e);
    }

    // Initial state: all zeros
    const initial: VoteStore = {};
    for (const c of COMPANIES) initial[c] = 0;
    return initial;
}

function saveVotes(votes: VoteStore, group: number) {
    const file = voteFile(group);
    try {
        fs.writeFileSync(file, JSON.stringify(votes, null, 2));
    } catch (e) {
        console.error(`[POLL] Failed to save votes for group ${group} to ${file}:`, e);
    }
}

function buildCompanyList(store: VoteStore) {
    return COMPANIES.map((name) => ({
        name,
        votes: store[name] ?? 0,
        disabled: (store[name] ?? 0) >= MAX_VOTES,
    }));
}

// Rate limiting per group
const rateLimitMap = new Map<string, number>();
function isRateLimited(ip: string, group: number): boolean {
    const key = `${ip}:${group}`;
    const last = rateLimitMap.get(key) ?? 0;
    if (Date.now() - last < RATE_LIMIT_MS) return true;
    rateLimitMap.set(key, Date.now());
    return false;
}

// Per-group write locks
const locks: Record<number, boolean> = { 1: false, 2: false };
async function withLock<T>(group: number, fn: () => T | Promise<T>): Promise<T> {
    while (locks[group]) await new Promise((r) => setTimeout(r, 5));
    locks[group] = true;
    try { return await fn(); }
    finally { locks[group] = false; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    // Parse and validate group param
    const groupParam = Number(req.query.group);
    if (!VALID_GROUPS.has(groupParam)) {
        return res.status(400).json({ error: "Parâmetro 'group' inválido. Use group=1 ou group=2." });
    }
    const group = groupParam as 1 | 2;

    if (req.method === "GET") {
        const store = loadVotes(group);
        return res.json({ companies: buildCompanyList(store) });
    }

    if (req.method === "POST") {
        const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ?? "unknown";

        if (isVotingClosed()) {
            return res.status(403).json({ error: "A votação foi encerrada em 27/02/2026 às 18h00." });
        }

        if (isRateLimited(ip, group)) {
            return res.status(429).json({ error: "Você já votou recentemente neste grupo. Aguarde alguns minutos." });
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
        if (new Set(names).size !== names.length) {
            return res.status(400).json({ error: "Seleções duplicadas não são permitidas." });
        }

        const result = await withLock(group, () => {
            const store = loadVotes(group);
            const overCapacity = names.filter((c) => (store[c] ?? 0) >= MAX_VOTES);
            if (overCapacity.length > 0) {
                return { error: `Vagas esgotadas: ${overCapacity.join(", ")}. Escolha outras empresas.` };
            }
            for (const c of names) store[c] = (store[c] ?? 0) + 1;
            saveVotes(store, group);
            return { companies: buildCompanyList(store) };
        });

        if ("error" in result) return res.status(409).json(result);
        return res.json({ ok: true, ...result });
    }

    return res.status(405).json({ error: "Method not allowed" });
}
