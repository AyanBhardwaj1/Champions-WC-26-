# Player rating methodology

The draft pool treats every player-tournament record the same way. There are no fame bonuses, manual overrides, “icon” lists, or post-hoc boosts. A player from Bulgaria 1994 is evaluated with the same formula as a player from Brazil 2002.

## Sources and coverage

The generator fetches the `squads`, `player_appearances`, `goals`, and `qualified_teams` CSVs from [The Fjelstul World Cup Database](https://github.com/jfjelstul/worldcup).

- Squad membership, player names, broad positions, appearances, starts, goals, and team finish come from the database.
- Player-appearance coverage begins in 1970. For 1930–1966, the generator deliberately uses squad membership, goals, and team finish only; it does not fabricate match appearances.
- The source does not contain assists or exact minutes played. `assists` is stored as `null`. Minutes are an explicit estimate: **90 per start + 30 per substitute appearance**.
- Specific sub-positions are deterministic formation-role estimates because the source records only goalkeeper, defender, midfielder, and forward. A stable hash distributes defenders across CB/FB/WB, midfielders across DM/CM/CAM/W, and forwards across ST/CF/W. The broad source position remains authoritative for slot compatibility.

Each generated player keeps the underlying inputs in the JSON so the rating can be audited.

## Formula

All values are calculated per player, per tournament:

```text
rating = round(
  48
  + min(14, appearances × 1.8)
  + min(6, starts × 0.8)
  + min(7, estimatedMinutes ÷ 90)
  + min(14, goals × positionGoalWeight)
  + teamSuccessModifier
)
```

The result is clamped to **45–97**.

Position goal weights reward rare scoring from deeper positions without making goals irrelevant for forwards:

| Broad position | Goal weight |
| --- | ---: |
| GK | 5.0 |
| DEF | 3.2 |
| MID | 2.1 |
| FWD | 1.45 |

Team-success modifiers:

| Finish | Modifier |
| --- | ---: |
| Winner | +14 |
| Runner-up / final | +11 |
| Semifinal | +9 |
| Quarterfinal | +7 |
| Round of 16 | +5 |
| Second group stage | +4 |
| Other / group or first stage | +2 |

## Team strength

World Cup 2026 teams use the official FIFA/Coca-Cola Men’s World Ranking published **11 June 2026**. FIFA ranking points are linearly converted to a 58–94 game-strength range:

```text
strength = round(58 + ((fifaPoints - 1100) / (1880 - 1100)) × 36)
```

The result is clamped to 58–94. This single aggregate strength is split into small deterministic attack, defense, goalkeeper, and mental variations inside the match engine. It is not a full roster rating.

## Interpretation limits

These ratings describe performance and team success in one World Cup tournament—not full-career ability. Older tournaments have thinner event coverage, goalkeepers and defenders have fewer box-score events, and estimated minutes are intentionally coarse. The values are game inputs and an independent interpretation of public data, not official FIFA or video-game ratings.
