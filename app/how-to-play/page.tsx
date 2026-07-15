import Link from "next/link";
import { ArrowRight, CircleDot, Dices, ListChecks, Search, Trophy } from "lucide-react";

export const metadata = { title: "How to play" };

export default function HowToPlayPage() {
  return <main className="info-page"><section className="info-hero shell"><span className="eyebrow">The rules</span><h1>Eleven spins.<br />Eight wins.</h1><p>Champions (WC 26) is a draft-and-simulate football game built around the complete history of the men’s World Cup.</p></section><section className="shell rules-stack">
    {[
      ["01", Dices, "Choose a formation and spin", "Pick 4-3-3, 4-4-2 or 3-5-2. Each spin lands on a nation-year squad that has not appeared in your draft before."],
      ["02", CircleDot, "Take exactly one player", "Choose one eligible player from the real squad roster. Place him into a matching open slot. The rating shown is computed from tournament appearances, goals and team finish."],
      ["03", Search, "Use your one Moss transfer", "After the eleventh spin, connect a Moss project and search all 10,973 player campaigns. You may make one position-compatible replacement, or skip the scout and keep your drafted XI."],
      ["04", ListChecks, "Replace a 2026 nation", "Choose one of the 48 World Cup 2026 teams. Your custom XI takes that team’s place in its real group."],
      ["05", Trophy, "Survive the tournament", "Play three group matches. Finish in the top two—or as one of the eight best third-placed teams—to reach the Round of 32. Then win five knockout games."],
    ].map(([number, Icon, title, copy]) => <article className="rule-row" key={number as string}><span className="rule-number">{number as string}</span><div className="rule-icon"><Icon size={24} /></div><div><h2>{title as string}</h2><p>{copy as string}</p></div></article>)}
    <div className="perfect-rule"><div><span>THE TARGET</span><strong>8–0</strong></div><p>A perfect run means eight wins and the trophy. Wins after extra time count. A penalty-shootout win advances you, but is visually marked and does not qualify for the perfect badge.</p></div>
    <Link href="/game" className="button button-primary button-large">Start your draft <ArrowRight size={18} /></Link>
  </section></main>;
}
