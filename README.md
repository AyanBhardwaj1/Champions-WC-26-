# Champions (WC 26)

Champions (WC 26) is a local draft-and-simulate football game. Spin through real historical men’s World Cup squads, draft an all-time XI, replace one team in the real 2026 field, and try to win the tournament with a perfect **8–0** record.

## Run locally

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The complete loop is available from `/game`:

1. Choose 4-3-3, 4-4-2, or 3-5-2.
2. Spin a historic nation/year squad and take one player.
3. Fill all 11 formation slots.
4. Replace one of the 48 World Cup 2026 nations.
5. Reveal the group stage and knockout rounds.
6. View and share the stored result.

Tournament runs are saved locally in `.local-data/champions-wc26.sqlite`. No external database or account is required.

## Data generation

The generated seed files are committed in `data/`, so a normal install does not need to download anything. To refresh them from their live sources:

```bash
npm run data:generate
```

This command writes:

- `data/draft-pool.json` — 489 usable historic squads and 10,973 player-tournament records spanning all 22 men’s World Cups from 1930–2022.
- `data/wc2026-field.json` — the 48-team World Cup 2026 field in Groups A–L, with strength ratings derived from the 11 June 2026 FIFA ranking.
- `data/data-sources.json` — generation timestamp and coverage metadata.

Historical squad data comes from [The Fjelstul World Cup Database](https://github.com/jfjelstul/worldcup), © 2023 Joshua C. Fjelstul, Ph.D., used and transformed under [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/legalcode). The 2026 group field is checked against the current tournament article and FIFA final-draw coverage. Rankings come from FIFA’s published ranking endpoint.

## Simulation

The engine simulates all 72 group matches, ranks the 12 groups, advances the top two plus the eight best third-place teams, then runs a 32-team single-elimination bracket. Goals use a seeded Poisson model based on attack, defense, formation, and team strength. Level knockout matches go to reduced-intensity extra time and then a near-even goalkeeper/mental-weighted shootout.

See [RATINGS.md](./RATINGS.md) for the exact player formula and limitations.

## Disclaimer

This is an unofficial fan-made project. It is not affiliated with, sponsored by, approved by, or endorsed by FIFA, any confederation, national association, player, or rights holder. Names and statistics are used descriptively. All ratings are an independent interpretation of public historical data.
