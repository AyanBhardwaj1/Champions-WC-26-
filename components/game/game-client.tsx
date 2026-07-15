"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleAlert,
  Dices,
  Gauge,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import field from "../../data/wc2026-field.json";
import { FORMATIONS } from "../../lib/formations";
import type { DraftPlayer, FieldTeam, FormationName, HistoricSquad, SimMatch } from "../../lib/types";
import { useGameStore } from "../../store/game-store";
import { Pitch } from "./pitch";
import { ScoutPhase } from "./scout-phase";

const formationCopy: Record<FormationName, { label: string; note: string }> = {
  "4-3-3": { label: "Front-foot", note: "+3 attack" },
  "4-4-2": { label: "Balanced", note: "+2 defense" },
  "3-5-2": { label: "Overload", note: "+2 attack" },
};

function formatScore(match: SimMatch) {
  let score = `${match.homeGoals}–${match.awayGoals}`;
  if (match.penalties) score += ` (${match.penalties.home}–${match.penalties.away} pens)`;
  else if (match.afterExtraTime) score += " AET";
  return score;
}

function SetupPhase() {
  const formation = useGameStore((state) => state.formation);
  const setFormation = useGameStore((state) => state.setFormation);
  const beginDraft = useGameStore((state) => state.beginDraft);
  return (
    <section className="game-phase setup-phase">
      <div className="phase-copy">
        <span className="step-tag">01 / Shape the side</span>
        <h1>Choose your system.</h1>
        <p>Your formation fixes the positions you need to fill and adds a small tactical modifier in the match engine.</p>
        <div className="formation-options">
          {(Object.keys(FORMATIONS) as FormationName[]).map((name) => (
            <button key={name} type="button" className={`formation-card ${formation === name ? "selected" : ""}`} onClick={() => setFormation(name)}>
              <span><Shield size={18} /> {formationCopy[name].label}</span>
              <strong>{name}</strong>
              <small>{formationCopy[name].note}</small>
              {formation === name && <i><Check size={13} /></i>}
            </button>
          ))}
        </div>
        <button type="button" className="button button-primary button-large" onClick={beginDraft}>Lock formation <ArrowRight size={18} /></button>
      </div>
      <div className="setup-pitch-wrap">
        <Pitch formation={formation} picks={[]} />
        <div className="pitch-caption"><span>{formation}</span><small>11 open positions</small></div>
      </div>
    </section>
  );
}

function DraftPhase() {
  const formation = useGameStore((state) => state.formation);
  const picks = useGameStore((state) => state.picks);
  const currentSquad = useGameStore((state) => state.currentSquad);
  const usedSquads = useGameStore((state) => state.usedSquads);
  const setCurrentSquad = useGameStore((state) => state.setCurrentSquad);
  const assignPlayer = useGameStore((state) => state.assignPlayer);
  const removePick = useGameStore((state) => state.removePick);
  const reset = useGameStore((state) => state.reset);
  const [selectedPlayer, setSelectedPlayer] = useState<DraftPlayer | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState("");

  const openPositions = useMemo(() => {
    const filled = new Set(picks.map((pick) => pick.slotId));
    return FORMATIONS[formation].filter((slot) => !filled.has(slot.id)).map((slot) => slot.position);
  }, [formation, picks]);
  const eligiblePlayers = currentSquad?.players.filter((player) => openPositions.includes(player.position)) ?? [];

  async function spin() {
    setSpinning(true);
    setSelectedPlayer(null);
    setError("");
    try {
      const request = fetch(`/api/squads?used=${encodeURIComponent(usedSquads.join(","))}`).then(async (response) => {
        if (!response.ok) throw new Error("The wheel could not find another squad.");
        return response.json() as Promise<HistoricSquad>;
      });
      const [squad] = await Promise.all([request, new Promise((resolve) => setTimeout(resolve, 1250))]);
      setCurrentSquad(squad);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Spin failed.");
    } finally {
      setSpinning(false);
    }
  }

  function assign(slotId: string) {
    if (!selectedPlayer) return;
    assignPlayer(selectedPlayer, slotId);
    setSelectedPlayer(null);
  }

  return (
    <section className="draft-layout">
      <aside className="draft-sidebar">
        <div className="draft-progress-head">
          <div><span className="step-tag">02 / Draft</span><h1>{picks.length}<small>/11</small></h1></div>
          <button type="button" className="icon-button" onClick={reset} aria-label="Restart draft"><RotateCcw size={16} /></button>
        </div>
        <div className="progress-track"><span style={{ width: `${(picks.length / 11) * 100}%` }} /></div>
        <p>{selectedPlayer ? `Choose a glowing ${selectedPlayer.position} slot for ${selectedPlayer.name}.` : currentSquad ? "Pick one eligible player from this World Cup squad." : "Spin for a historic nation and year."}</p>
        <div className="mini-draft-list">
          {FORMATIONS[formation].map((slot) => {
            const pick = picks.find((item) => item.slotId === slot.id);
            return <div key={slot.id} className={pick ? "complete" : ""}><span>{slot.label}</span><strong>{pick?.player.name ?? "Open"}</strong>{pick && <small>{pick.player.rating}</small>}</div>;
          })}
        </div>
      </aside>

      <div className="draft-pitch-column">
        <Pitch formation={formation} picks={picks} selectedPlayer={selectedPlayer} onAssign={assign} onRemove={selectedPlayer ? undefined : removePick} />
        <div className="selection-hint">
          {selectedPlayer ? <><Sparkles size={15} /> Select a highlighted slot to confirm</> : <><Target size={15} /> {11 - picks.length} positions left</>}
        </div>
      </div>

      <div className="draft-pool-panel">
        {!currentSquad ? (
          <div className="wheel-stage">
            <div className={`wheel ${spinning ? "spinning" : ""}`}>
              <div className="wheel-ring" />
              <div className="wheel-core"><span>{spinning ? "?" : picks.length + 1}</span><small>{spinning ? "SEARCHING" : "NEXT PICK"}</small></div>
              <i className="wheel-pointer" />
            </div>
            <h2>{spinning ? "History is turning…" : "Spin the World Cup wheel"}</h2>
            <p>489 real squads. Every men’s tournament from Uruguay 1930 to Qatar 2022.</p>
            {error && <div className="inline-error"><CircleAlert size={15} /> {error}</div>}
            <button type="button" className="button button-primary button-large" onClick={spin} disabled={spinning}>
              {spinning ? <LoaderCircle className="spin-icon" size={18} /> : <Dices size={18} />} {spinning ? "Spinning" : "Spin the wheel"}
            </button>
          </div>
        ) : (
          <div className="squad-panel">
            <div className="squad-title-row">
              <div className="nation-stamp"><span>{currentSquad.nationCode}</span></div>
              <div><span className="eyebrow">The wheel says</span><h2>{currentSquad.nation} <b>{currentSquad.year}</b></h2><p>{currentSquad.finish} · {currentSquad.players.length}-player squad</p></div>
            </div>
            <div className="roster-guide"><span>Select one player</span><small>{eligiblePlayers.length} fit your open slots</small></div>
            <div className="player-grid">
              {eligiblePlayers.map((player) => (
                <button key={player.id} type="button" className={`player-card ${selectedPlayer?.id === player.id ? "selected" : ""}`} onClick={() => setSelectedPlayer(selectedPlayer?.id === player.id ? null : player)}>
                  <div className="player-rating"><strong>{player.rating}</strong><span>{player.subPosition}</span></div>
                  <div className="player-card-copy"><strong>{player.name}</strong><small>{player.inputs.appearances} apps · {player.inputs.goals} goals</small></div>
                  <span className="card-chevron"><ChevronRight size={15} /></span>
                </button>
              ))}
            </div>
            {!eligiblePlayers.length && <div className="inline-error"><CircleAlert size={15} /> No player in this roster fits your remaining slots. This squad is skipped automatically.</div>}
          </div>
        )}
      </div>
    </section>
  );
}

function EntryPhase() {
  const formation = useGameStore((state) => state.formation);
  const picks = useGameStore((state) => state.picks);
  const scoutReplacement = useGameStore((state) => state.scoutReplacement);
  const openScout = useGameStore((state) => state.openScout);
  const beginSimulation = useGameStore((state) => state.beginSimulation);
  const setResult = useGameStore((state) => state.setResult);
  const returnToEntry = useGameStore((state) => state.returnToEntry);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const groups = useMemo(() => Object.groupBy(field as FieldTeam[], (team) => team.group), []);
  const selected = (field as FieldTeam[]).find((team) => team.team === selectedTeam);
  const rating = Math.round(picks.reduce((sum, pick) => sum + pick.player.rating, 0) / 11);

  async function simulate() {
    if (!selectedTeam) return;
    setLoading(true);
    setError("");
    beginSimulation();
    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ xi: picks, formation, replacedTeam: selectedTeam }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Simulation failed.");
      setResult(body);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Simulation failed.");
      returnToEntry();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="entry-layout">
      <div className="entry-copy">
        <span className="step-tag">04 / Enter the bracket</span>
        <h1>Take someone’s place.</h1>
        <p>Choose one real 2026 nation. Your XI inherits its group, opponents and route through the tournament.</p>
        {scoutReplacement ? (
          <div className="completed-scout-transfer">
            <Sparkles size={17} />
            <div><span>Moss transfer complete</span><strong>{scoutReplacement.outgoing.name} → {scoutReplacement.incoming.name}</strong></div>
          </div>
        ) : (
          <button type="button" className="reopen-scout-button" onClick={openScout}><Sparkles size={16} /><span><strong>Want your Moss transfer?</strong><small>You can still replace one position-compatible player before entering.</small></span><ArrowRight size={16} /></button>
        )}
        <label className="field-label" htmlFor="team-slot">World Cup 2026 slot</label>
        <select id="team-slot" className="team-select" value={selectedTeam} onChange={(event) => setSelectedTeam(event.target.value)}>
          <option value="">Select a nation…</option>
          {Object.entries(groups).map(([group, teams]) => (
            <optgroup label={`Group ${group}`} key={group}>{teams?.map((team) => <option value={team.team} key={team.team}>{team.team} · FIFA #{team.fifaRanking}</option>)}</optgroup>
          ))}
        </select>
        {selected && (
          <div className="selected-group-card">
            <div><span>GROUP {selected.group}</span><strong>{selected.team}</strong><small>FIFA #{selected.fifaRanking} · {selected.strengthRating} strength</small></div>
            <div className="group-opponents">
              {(field as FieldTeam[]).filter((team) => team.group === selected.group && team.team !== selected.team).map((team) => <span key={team.team}>{team.team}</span>)}
            </div>
          </div>
        )}
        {error && <div className="inline-error"><CircleAlert size={15} /> {error}</div>}
        <button type="button" className="button button-primary button-large" onClick={simulate} disabled={!selectedTeam || loading}>
          {loading ? <LoaderCircle className="spin-icon" size={18} /> : <Trophy size={18} />} {loading ? "Building tournament" : "Enter World Cup"}
        </button>
      </div>
      <div className="entry-xi-card">
        <div className="entry-xi-head"><div><span className="eyebrow">Your final XI</span><h2>{formation}</h2></div><div className="rating-orb"><strong>{rating}</strong><small>OVR</small></div></div>
        <Pitch formation={formation} picks={picks} compact />
        <div className="entry-metrics"><span><Gauge size={15} /> {rating} squad rating</span><span><Users size={15} /> {new Set(picks.map((pick) => pick.player.nation)).size} nations</span></div>
      </div>
    </section>
  );
}

function SimulationPhase() {
  const router = useRouter();
  const result = useGameStore((state) => state.result);
  const [revealCount, setRevealCount] = useState(0);
  if (!result) {
    return <section className="simulation-loading"><span className="loader-ring" /><span className="step-tag">05 / Simulation</span><h1>Drawing the tournament…</h1><p>Simulating the complete World Cup around your custom XI.</p></section>;
  }
  const visible = result.path.slice(0, revealCount);
  const groupDone = revealCount >= Math.min(3, result.path.length);
  const complete = revealCount >= result.path.length;
  const next = result.path[revealCount];
  return (
    <section className="simulation-layout">
      <div className="simulation-head"><div><span className="step-tag">05 / Simulation</span><h1>The road to {result.perfect ? "8–0" : "glory"}.</h1></div><div className="live-badge"><span /> TOURNAMENT ENGINE</div></div>
      <div className="simulation-grid">
        <div className="sim-timeline">
          {visible.map((match, index) => (
            <article key={match.id} className={`sim-match outcome-${match.customOutcome?.toLowerCase()}`}>
              <div className="sim-index">{String(index + 1).padStart(2, "0")}</div>
              <div><span>{match.stage}</span><strong>{match.home} <b>{formatScore(match)}</b> {match.away}</strong><small>{match.penalties ? "Decided on penalties" : match.afterExtraTime ? "After extra time" : "Full time"}</small></div>
              <div className="sim-outcome">{match.customOutcome}</div>
            </article>
          ))}
          {!visible.length && <div className="sim-empty"><LockKeyhole size={30} /><h3>The fixtures are sealed.</h3><p>Reveal your group stage to begin.</p></div>}
          {!complete && visible.length > 0 && <div className="next-fixture"><span>UP NEXT</span><strong>{next?.stage}</strong><small>Champions XI vs {next?.customOpponent}</small></div>}
        </div>
        <aside className="sim-side-panel">
          <span className="eyebrow">Group {result.group}</span><h3>{groupDone ? "Final standings" : "Table pending"}</h3>
          {groupDone ? (
            <table className="group-table"><thead><tr><th>#</th><th>Team</th><th>GD</th><th>Pts</th></tr></thead><tbody>{result.groupTable.map((row, index) => <tr key={row.team} className={row.team === "Champions XI" ? "custom-row" : ""}><td>{index + 1}</td><td>{row.team}</td><td>{row.gd > 0 ? `+${row.gd}` : row.gd}</td><td><strong>{row.points}</strong></td></tr>)}</tbody></table>
          ) : <div className="table-skeleton">{[1, 2, 3, 4].map((row) => <span key={row} />)}</div>}
          <div className="sim-record"><span>{result.record.wins}</span><small>W</small><span>{result.record.draws}</span><small>D</small><span>{result.record.losses}</span><small>L</small></div>
        </aside>
      </div>
      <div className="simulation-actions">
        {!complete ? (
          <button type="button" className="button button-primary button-large" onClick={() => setRevealCount(revealCount === 0 ? Math.min(3, result.path.length) : revealCount + 1)}>
            {revealCount === 0 ? "Simulate group stage" : `Play ${next?.stage}`} <ArrowRight size={18} />
          </button>
        ) : (
          <button type="button" className="button button-primary button-large" onClick={() => router.push(`/results/${result.id}`)}>
            View final result <Trophy size={18} />
          </button>
        )}
      </div>
    </section>
  );
}

export function GameClient() {
  const phase = useGameStore((state) => state.phase);
  return (
    <main className="game-main shell-wide">
      {phase === "setup" && <SetupPhase />}
      {phase === "draft" && <DraftPhase />}
      {phase === "scout" && <ScoutPhase />}
      {phase === "entry" && <EntryPhase />}
      {phase === "simulation" && <SimulationPhase />}
    </main>
  );
}
