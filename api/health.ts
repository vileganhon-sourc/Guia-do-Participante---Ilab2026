// api/health.ts — Vercel Serverless Function for /api/health
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
    res.json({ status: "ok", v: "5.0" });
}
