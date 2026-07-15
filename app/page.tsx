import Link from "next/link";
import { ArrowRight, Dices, Goal, Search, ShieldCheck, Trophy } from "lucide-react";
import sources from "../data/data-sources.json";
import { HomeStats } from "../components/home-stats";

const steps = [
  { number: "01", icon: Dices, title: "Spin history", copy: "The wheel lands on one of 489 real men’s World Cup squads, from 1930 to 2022." },
  { number: "02", icon: ShieldCheck, title: "Draft one icon", copy: "Choose one player from that squad and place him into an open position in your XI." },
  { number: "03", icon: Search, title: "Make one Moss move", copy: "Search the complete archive conversationally and optionally replace one position-compatible player." },
  { number: "04", icon: Goal, title: "Take a 2026 slot", copy: "Replace one of the 48 real teams and inherit its group, opponents and bracket route." },
  { number: "05", icon: Trophy, title: "Go 8–0", copy: "Win three group games and five knockout ties. Penalty wins count—but break the perfect run." },
];

export default function Home() {
  return (
    <main>
      <section className="home-hero">
        <div className="hero-grid-lines" />
        <div className="shell hero-layout">
          <div className="hero-copy">
            <span className="hero-tag"><i /> WORLD CUP HISTORY, REBUILT</span>
            <h1>Build the XI.<br />Chase the <em>8–0.</em></h1>
            <p>Draft eleven players from every era of the World Cup. Drop them into the 2026 field. See if football history can survive eight games.</p>
            <div className="hero-actions">
              <Link href="/game" className="button button-primary button-large">Start your run <ArrowRight size={18} /></Link>
              <Link href="/how-to-play" className="text-link">See how it works <span>↗</span></Link>
            </div>
            <div className="hero-proof">
              <span><strong>{sources.draftPool.squads}</strong> historic squads</span>
              <span><strong>{sources.draftPool.players.toLocaleString("en-US")}</strong> player-tournaments</span>
              <span><strong>48</strong> teams in 2026</span>
            </div>
          </div>
          <div className="hero-score-art" aria-label="The perfect target is eight wins and zero losses">
            <div className="score-orbit orbit-one" /><div className="score-orbit orbit-two" />
            <div className="score-label score-label-top">PERFECT RUN</div>
            <div className="giant-score"><span>8</span><i>–</i><span>0</span></div>
            <div className="score-label score-label-bottom">3 GROUP · 5 KNOCKOUT</div>
            <div className="score-chip chip-left">NO PENALTIES</div>
            <div className="score-chip chip-right">WORLD CHAMPIONS</div>
          </div>
        </div>
        <div className="ticker" aria-hidden="true"><div>SPIN · DRAFT · BUILD · SIMULATE · 8–0 · SPIN · DRAFT · BUILD · SIMULATE · 8–0 ·</div></div>
      </section>

      <HomeStats />

      <section className="how-section shell">
        <div className="section-heading split-heading">
          <div><span className="eyebrow">Five moves from glory</span><h2>One player at a time.</h2></div>
          <p>No transfer budget. No chemistry hacks. Just one pick from every squad the wheel gives you.</p>
        </div>
        <div className="step-grid">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <article className="step-card" key={step.number}>
                <div className="step-card-top"><span>{step.number}</span><Icon size={22} /></div>
                <h3>{step.title}</h3><p>{step.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="data-section">
        <div className="shell data-layout">
          <div className="data-visual">
            <div className="era-card era-1930"><span>URU</span><strong>1930</strong><small>THE FIRST</small></div>
            <div className="era-line" />
            <div className="era-card era-2022"><span>ARG</span><strong>2022</strong><small>THE LATEST</small></div>
            <div className="data-count"><strong>22</strong><small>TOURNAMENTS</small></div>
          </div>
          <div className="data-copy">
            <span className="eyebrow">Real squads. One formula.</span>
            <h2>Every tournament. Every nation. No invented rosters.</h2>
            <p>The wheel is built from the open Fjelstul World Cup Database: actual squads, appearances and goals across all 22 men’s tournaments. Ratings use the same published formula for every player.</p>
            <div className="data-links"><a href="https://github.com/jfjelstul/worldcup" target="_blank" rel="noreferrer">Explore the source ↗</a><Link href="/disclaimer">Read the methodology →</Link></div>
          </div>
        </div>
      </section>

      <section className="final-cta shell">
        <div><span className="eyebrow">Your wheel is waiting</span><h2>History gives you eleven spins.<br />What do you build?</h2></div>
        <Link href="/game" className="button button-light button-large">Draft your XI <ArrowRight size={18} /></Link>
      </section>
    </main>
  );
}
