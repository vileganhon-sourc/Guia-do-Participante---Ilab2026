import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
    CheckCircle2, Trophy, TrendingUp, Loader2,
    Users, ChevronRight, Clock, Lock
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────
const MAX_SELECTIONS = 8;
const API_BASE = "/api/poll";

// Deadline: 2026-02-27 18:00:00 Brasília (UTC-3)
const DEADLINE = new Date("2026-02-27T21:00:00.000Z");

const GROUPS = {
    1: { label: "Grupo 1", gtis: ["CONSESP", "CNCG"], color: "#e1ad31" },
    2: { label: "Grupo 2", gtis: ["CONCPC", "CONDPCI"], color: "#2b7fff" },
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────
interface CompanyData { name: string; votes: number; disabled: boolean; }
type Phase = "group-select" | "loading" | "voting" | "submitting" | "done" | "closed-loading" | "closed";
type Group = 1 | 2;

// ── Static company info (CNPJ + Razão Social) ─────────────────────────────────
const COMPANY_INFO: Record<string, { cnpj: string; razao: string }> = {
    "Actatec": { cnpj: "34.032.252/0001-14", razao: "Actatec Indústria e Comércio de Peças e Acessórios para Veículos Ltda" },
    "ADTech": { cnpj: "01.866.443/0001-22", razao: "Adtech Informática Ltda - EPP" },
    "Aeromot": { cnpj: "92.833.110/0001-52", razao: "Aeromot Aeronaves e Motores S/A" },
    "Airbus": { cnpj: "08.373.694/0001-14", razao: "Airbus Brasil Negócios Aeroespaciais Ltda" },
    "Axon": { cnpj: "26.230.158/0001-34", razao: "Axon Enterprise Brasil Ltda" },
    "Berkana": { cnpj: "07.241.050/0001-10", razao: "Berkana Tecnologia em Segurança Ltda" },
    "BGS": { cnpj: "03.968.100/0001-19", razao: "BGS Sistemas de Segurança Ltda" },
    "Byrna": { cnpj: "39.467.433/0001-08", razao: "Byrna Brasil Comércio de Equipamentos e Produtos de Segurança Ltda" },
    "Clarian": { cnpj: "07.351.488/0001-63", razao: "Clarian Tecnologia Ltda" },
    "Condor": { cnpj: "33.652.332/0001-08", razao: "Condor S/A Indústria Química" },
    "Digitro": { cnpj: "83.473.066/0001-41", razao: "Dígitro Tecnologia S/A" },
    "Flash": { cnpj: "02.839.274/0001-67", razao: "Flash Engenharia e Equipamentos Ltda" },
    "Ford": { cnpj: "03.470.724/0001-13", razao: "Ford Motor Company Brasil Ltda" },
    "Funcional": { cnpj: "04.145.411/0001-18", razao: "Funcional Consultoria e Tecnologia Ltda" },
    "Glagio": { cnpj: "05.805.957/0001-53", razao: "Glagio do Brasil Ltda" },
    "Helper": { cnpj: "21.055.056/0001-09", razao: "Helper Tecnologia de Segurança S/A" },
    "Hex360": { cnpj: "22.955.938/0001-54", razao: "Hex 360 Soluções Tecnológicas Ltda" },
    "Inspect": { cnpj: "15.656.744/0001-97", razao: "Inspect Tecnologia e Consultoria Ltda" },
    "Iron Fence": { cnpj: "30.124.965/0001-46", razao: "Iron Fence Segurança Ltda" },
    "Magnet": { cnpj: "00.320.106/0001-44", razao: "Magnet Engenharia e Sistemas Ltda" },
    "Montreal": { cnpj: "33.025.299/0001-41", razao: "Montreal Informática S/A" },
    "Motorola": { cnpj: "01.011.664/0001-00", razao: "Motorola Solutions Ltda" },
    "Protecta": { cnpj: "04.995.839/0001-20", razao: "Protecta Defesa e Proteção Ltda" },
    "Raytec": { cnpj: "08.854.417/0001-54", razao: "Raytec Brasil Sistemas de Segurança Ltda" },
    "Revo": { cnpj: "41.520.150/0001-45", razao: "Revo Tecnologia e Serviços Ltda" },
    "Smart Power": { cnpj: "13.568.109/0001-13", razao: "Smart Power Tecnologia Ltda" },
    "Techbiz": { cnpj: "05.651.983/0001-83", razao: "Techbiz Forensics S/A" },
    "Teltronic": { cnpj: "05.340.542/0001-00", razao: "Teltronic Brasil Ltda" },
    "Ulbrichts": { cnpj: "23.364.577/0001-93", razao: "Ulbrichts Brasil Indústria e Comércio de Equipamentos de Proteção Ltda" },
    "Valid": { cnpj: "33.113.111/0001-20", razao: "Valid Soluções S/A" },
    "VMI": { cnpj: "21.056.289/0001-40", razao: "VMI Sistemas de Segurança Ltda" },
};

// ── Deadline helpers ──────────────────────────────────────────────────────────
function isClosed() { return Date.now() >= DEADLINE.getTime(); }

function timeLeft() {
    const diff = Math.max(0, DEADLINE.getTime() - Date.now());
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1_000);
    return { h, m, s, total: diff };
}

// ── CountdownBadge ────────────────────────────────────────────────────────────
const CountdownBadge = memo(function CountdownBadge({ onExpire }: { onExpire: () => void }) {
    const [tl, setTl] = useState(timeLeft);

    useEffect(() => {
        if (tl.total === 0) { onExpire(); return; }
        const id = setInterval(() => {
            const next = timeLeft();
            setTl(next);
            if (next.total === 0) { clearInterval(id); onExpire(); }
        }, 1_000);
        return () => clearInterval(id);
    }, []); // eslint-disable-line

    const pad = (n: number) => String(n).padStart(2, "0");

    return (
        <div className="poll-timer">
            <Clock className="poll-timer-icon" aria-hidden="true" />
            <span className="poll-timer-label">Votação encerra em</span>
            <span className="poll-timer-digits" aria-live="off" aria-atomic="true">
                {pad(tl.h)}:{pad(tl.m)}:{pad(tl.s)}
            </span>
        </div>
    );
});

// ── ProgressBar ───────────────────────────────────────────────────────────────
const ProgressBar = memo(function ProgressBar({ value, max }: { value: number; max: number }) {
    const pct = Math.round((value / max) * 100);
    return (
        <div className="poll-progress-track" role="progressbar"
            aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}
            aria-label={`${value} de ${max} empresas selecionadas`}>
            <div className="poll-progress-fill" style={{ width: `${pct}%` }} />
        </div>
    );
});

// ── CompanyCard ───────────────────────────────────────────────────────────────
interface CompanyCardProps {
    company: CompanyData; selected: boolean; blocked: boolean;
    onToggle: (name: string) => void;
}

const CompanyCard = memo(function CompanyCard({ company, selected, blocked, onToggle }: CompanyCardProps) {
    const isDisabled = company.disabled || (blocked && !selected);
    const handleClick = useCallback(() => { if (!isDisabled) onToggle(company.name); }, [isDisabled, onToggle, company.name]);
    const info = COMPANY_INFO[company.name];

    return (
        <button type="button" onClick={handleClick} disabled={isDisabled} aria-pressed={selected}
            aria-label={`${company.name}${company.disabled ? " — vagas esgotadas" : ""}`}
            className={`poll-card poll-card--list${selected ? " poll-card--selected" : ""}${isDisabled ? " poll-card--disabled" : ""}`}>
            <div className="poll-card-list-body">
                <span className="poll-card-name">{company.name}</span>
                {info && (
                    <>
                        <span className="poll-card-cnpj">CNPJ: {info.cnpj}</span>
                        <span className="poll-card-razao">{info.razao}</span>
                    </>
                )}
                {company.disabled && <span className="poll-card-full-badge">Esgotado</span>}
            </div>
            {selected && <CheckCircle2 className="poll-card-check" aria-hidden="true" />}
        </button>
    );
});

// ── RankingBar ────────────────────────────────────────────────────────────────
const RankingBar = memo(function RankingBar({ company, rank, maxVotes }: { company: CompanyData; rank: number; maxVotes: number }) {
    const pct = maxVotes > 0 ? Math.round((company.votes / maxVotes) * 100) : 0;
    const medals = ["🥇", "🥈", "🥉"];
    return (
        <div className="poll-rank-row">
            <span className="poll-rank-num" aria-hidden="true">{medals[rank] ?? `#${rank + 1}`}</span>
            <div className="poll-rank-info">
                <div className="poll-rank-header">
                    <span className="poll-rank-name">{company.name}</span>
                    <span className="poll-rank-votes">{company.votes} votos</span>
                </div>
                <div className="poll-rank-track">
                    <div className="poll-rank-fill" style={{ width: `${pct}%`, animationDelay: `${rank * 80}ms` }} />
                </div>
            </div>
        </div>
    );
});

// ── GroupSelector ─────────────────────────────────────────────────────────────
const GroupSelector = memo(function GroupSelector({ onSelect }: { onSelect: (g: Group) => void }) {
    return (
        <div className="poll-group-selector">
            <div className="poll-group-header">
                <Users className="poll-group-icon" aria-hidden="true" />
                <div>
                    <h3 className="poll-group-title">A qual grupo você pertence?</h3>
                    <p className="poll-group-subtitle">Selecione seu GTI antes de votar</p>
                </div>
            </div>

            <div className="poll-group-cards">
                {([1, 2] as Group[]).map((g) => {
                    const group = GROUPS[g];
                    return (
                        <button key={g} type="button" onClick={() => onSelect(g)}
                            className="poll-group-card"
                            aria-label={`Selecionar ${group.label}: ${group.gtis.join(" e ")}`}
                            style={{ "--group-color": group.color } as React.CSSProperties}>
                            <div className="poll-group-card-accent" />
                            <div className="poll-group-card-body">
                                <div className="poll-group-card-label">{group.label}</div>
                                <div className="poll-group-card-gtis">
                                    {group.gtis.map((gti) => <span key={gti} className="poll-group-tag">{gti}</span>)}
                                </div>
                            </div>
                            <ChevronRight className="poll-group-chevron" aria-hidden="true" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
});

// ── ClosedResults ─────────────────────────────────────────────────────────────
function ClosedResults({ results }: { results: Record<Group, CompanyData[]> }) {
    return (
        <div className="poll-closed">
            <div className="poll-closed-header">
                <div className="poll-closed-lock" aria-hidden="true">
                    <Lock className="poll-closed-lock-icon" />
                </div>
                <div>
                    <h3 className="poll-dashboard-title">Votação Encerrada</h3>
                    <p className="poll-dashboard-subtitle">Empresas selecionadas para o Security Day</p>
                </div>
            </div>

            <div className="poll-closed-groups">
                {([1, 2] as Group[]).map((g) => {
                    const group = GROUPS[g];
                    const top = results[g].slice(0, MAX_SELECTIONS);
                    const maxVotes = top[0]?.votes ?? 0;
                    return (
                        <div key={g} className="poll-closed-group" style={{ "--group-color": group.color } as React.CSSProperties}>
                            <div className="poll-closed-group-header">
                                <span className="poll-closed-group-accent" />
                                <div>
                                    <div className="poll-closed-group-label">{group.label}</div>
                                    <div className="poll-group-card-gtis" style={{ marginTop: "0.25rem" }}>
                                        {group.gtis.map((gti) => <span key={gti} className="poll-group-tag">{gti}</span>)}
                                    </div>
                                </div>
                                <Trophy className="poll-closed-trophy" aria-hidden="true" />
                            </div>
                            <ol className="poll-ranking" aria-label={`Ranking ${group.label}`}>
                                {top.map((company, i) => (
                                    <li key={company.name}>
                                        <RankingBar company={company} rank={i} maxVotes={maxVotes} />
                                    </li>
                                ))}
                                {top.length === 0 && (
                                    <li className="poll-closed-empty">Nenhum voto registrado.</li>
                                )}
                            </ol>
                        </div>
                    );
                })}
            </div>

            <div className="poll-dashboard-note">
                <TrendingUp className="poll-note-icon" aria-hidden="true" />
                <span>Resultado final — votação encerrada em 27/02/2026 às 18h00</span>
            </div>
        </div>
    );
}

// ── SecurityDayPoll ───────────────────────────────────────────────────────────
export function SecurityDayPoll() {
    const [group, setGroup] = useState<Group | null>(null);
    const [companies, setCompanies] = useState<CompanyData[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [phase, setPhase] = useState<Phase>(() => isClosed() ? "closed-loading" : "group-select");
    const [error, setError] = useState<string | null>(null);
    const [topEight, setTopEight] = useState<CompanyData[]>([]);
    const [closedResults, setClosedResults] = useState<Record<Group, CompanyData[]>>({ 1: [], 2: [] });

    const apiUrl = useCallback((g: Group) => `${API_BASE}?group=${g}`, []);

    // Fetch closed results for both groups
    const loadClosedResults = useCallback(() => {
        setPhase("closed-loading");
        Promise.all([
            fetch(apiUrl(1)).then((r) => r.json()),
            fetch(apiUrl(2)).then((r) => r.json()),
        ])
            .then(([d1, d2]) => {
                const sort = (arr: CompanyData[]) => [...arr].sort((a, b) => b.votes - a.votes);
                setClosedResults({
                    1: sort((d1 as { companies: CompanyData[] }).companies ?? []),
                    2: sort((d2 as { companies: CompanyData[] }).companies ?? []),
                });
                setPhase("closed");
            })
            .catch(() => {
                setClosedResults({ 1: [], 2: [] });
                setPhase("closed");
            });
    }, [apiUrl]);

    // On mount: if already past deadline, load closed results
    useEffect(() => {
        if (isClosed()) loadClosedResults();
    }, [loadClosedResults]);

    // Load companies after group selected (only if not closed)
    useEffect(() => {
        if (!group || isClosed()) return;
        setPhase("loading");
        fetch(apiUrl(group))
            .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
            .then((data: { companies: CompanyData[] }) => { setCompanies(data.companies); setPhase("voting"); })
            .catch(() => { setError("Não foi possível carregar a enquete. Tente recarregar."); setPhase("voting"); });
    }, [group, apiUrl]);

    const isMaxReached = useMemo(() => selected.length >= MAX_SELECTIONS, [selected.length]);
    const maxVotes = useMemo(() => topEight[0]?.votes ?? 0, [topEight]);

    const toggle = useCallback((name: string) => {
        setSelected((prev) => {
            if (prev.includes(name)) return prev.filter((n) => n !== name);
            if (prev.length >= MAX_SELECTIONS) return prev;
            return [...prev, name];
        });
    }, []);

    // Auto-submit when 8 selected
    useEffect(() => {
        if (selected.length !== MAX_SELECTIONS || phase !== "voting" || !group) return;
        if (isClosed()) { loadClosedResults(); return; }

        setPhase("submitting");
        setError(null);

        fetch(apiUrl(group), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ companies: selected }),
        })
            .then((r) => r.json())
            .then((data: { error?: string; companies?: CompanyData[] }) => {
                if (data.error) { setError(data.error); setPhase("voting"); setSelected([]); return; }
                const all = data.companies ?? [];
                setCompanies(all);
                const sorted = [...all].sort((a, b) => b.votes - a.votes).slice(0, MAX_SELECTIONS);
                setTopEight(sorted);
                setPhase("done");
            })
            .catch(() => { setError("Erro ao enviar votos. Tente novamente."); setPhase("voting"); setSelected([]); });
    }, [selected, phase, group, apiUrl, loadClosedResults]);

    // ── Closed loading ────────────────────────────────────────────────────────
    if (phase === "closed-loading") {
        return (
            <div className="poll-loading">
                <Loader2 className="poll-loading-icon" aria-hidden="true" />
                <span>Carregando resultados finais…</span>
            </div>
        );
    }

    // ── Closed ────────────────────────────────────────────────────────────────
    if (phase === "closed") {
        return <ClosedResults results={closedResults} />;
    }

    // ── Loading ───────────────────────────────────────────────────────────────
    if (phase === "loading") {
        return (
            <div className="poll-loading">
                <Loader2 className="poll-loading-icon" aria-hidden="true" />
                <span>Carregando enquete…</span>
            </div>
        );
    }

    // ── Dashboard (after vote) ────────────────────────────────────────────────
    if (phase === "done") {
        const groupInfo = GROUPS[group!];
        return (
            <div className="poll-dashboard">
                <div className="poll-dashboard-header">
                    <div className="poll-dashboard-trophy" aria-hidden="true">
                        <Trophy className="poll-dashboard-trophy-icon" />
                    </div>
                    <div>
                        <h3 className="poll-dashboard-title">Obrigado pelo seu voto!</h3>
                        <p className="poll-dashboard-subtitle">
                            As 8 empresas mais votadas — <strong>{groupInfo.label}</strong> ({groupInfo.gtis.join(" · ")})
                        </p>
                    </div>
                </div>
                <ol className="poll-ranking" aria-label="Ranking das empresas">
                    {topEight.map((company, i) => (
                        <li key={company.name}><RankingBar company={company} rank={i} maxVotes={maxVotes} /></li>
                    ))}
                </ol>
                <div className="poll-dashboard-note">
                    <TrendingUp className="poll-note-icon" aria-hidden="true" />
                    <span>Ranking atualizado em tempo real com os votos de todos os participantes</span>
                </div>
            </div>
        );
    }

    // ── Group select ──────────────────────────────────────────────────────────
    if (phase === "group-select") {
        return (
            <div className="poll-container">
                <CountdownBadge onExpire={loadClosedResults} />
                <GroupSelector onSelect={(g) => setGroup(g)} />
            </div>
        );
    }

    // ── Voting ────────────────────────────────────────────────────────────────
    const isSubmitting = phase === "submitting";
    const groupInfo = GROUPS[group!];

    return (
        <div className="poll-container" aria-busy={isSubmitting}>
            <CountdownBadge onExpire={loadClosedResults} />

            <div className="poll-group-badge" style={{ "--group-color": groupInfo.color } as React.CSSProperties}>
                <span className="poll-group-badge-label">{groupInfo.label}</span>
                {groupInfo.gtis.map((gti) => <span key={gti} className="poll-group-tag poll-group-tag--sm">{gti}</span>)}
                <button type="button" className="poll-group-badge-change"
                    onClick={() => { setGroup(null); setSelected([]); setCompanies([]); setPhase("group-select"); }}>
                    Trocar grupo
                </button>
            </div>

            <div className="poll-counter-bar">
                <div className="poll-counter-text" aria-atomic="true">
                    <span className="poll-counter-num">{selected.length}</span>
                    <span className="poll-counter-sep" aria-hidden="true">/</span>
                    <span className="poll-counter-max">{MAX_SELECTIONS}</span>
                    <span className="poll-counter-label">empresas selecionadas</span>
                </div>
                {isSubmitting && (
                    <div className="poll-submitting" role="status">
                        <Loader2 className="poll-submitting-icon" aria-hidden="true" />
                        <span>Registrando…</span>
                    </div>
                )}
            </div>

            <ProgressBar value={selected.length} max={MAX_SELECTIONS} />

            {error && <div className="poll-error" role="alert" aria-live="assertive">{error}</div>}

            <div className="poll-list" role="group" aria-label={`Selecione ${MAX_SELECTIONS} empresas para o Security Day`}>
                {companies.map((company) => (
                    <CompanyCard key={company.name} company={company}
                        selected={selected.includes(company.name)}
                        blocked={isMaxReached || isSubmitting}
                        onToggle={toggle} />
                ))}
            </div>

            <p className="poll-hint" aria-live="polite">
                {isMaxReached
                    ? "✅ Seleção completa! Registrando seus votos…"
                    : `Selecione mais ${MAX_SELECTIONS - selected.length} empresa${MAX_SELECTIONS - selected.length !== 1 ? "s" : ""}`}
            </p>
        </div>
    );
}
