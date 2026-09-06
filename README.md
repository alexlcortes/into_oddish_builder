# Pokemon Character Builder

A vanilla HTML/CSS/JavaScript web app for generating Pokemon character starter stats, tracking battle and daily moves, using consumable items with target selection, and managing bench save slots.

## How It Works

1. **Roll Ability Scores**: Click **Create New Character** to roll three ability scores using 2d6:
   - **Strength**: Fighting, fortitude, and toughness
   - **Dexterity**: Stealth, athletics, and reflexes
   - **Willpower**: Confidence, discipline, and charisma

2. **Optional Reroll**: Before choosing your main attribute, you can optionally reroll your lowest score.

3. **Choose Main Attribute**: If multiple scores tie for highest, select which will be your primary attribute. If there's a clear highest, it's automatically assigned.

4. **Get Your Pokemon**: Once your main attribute is locked in, the app determines your starter Pokemon based on:
   - Your **main ability type** (Strength, Dexterity, or Willpower)
   - Your **ability score** (ranges: 2-7, 8, 9, 10-11, 12)

5. **Pokedollars**: You also receive 1d6 Pokedollars as starting currency.

6. **Starting Pokemon Stats & Moves**: After your starter is determined, the app displays its starting kit:
   - **Hit Points**: Rolled from that Pokemon's configured hit point die and shown as `current/max HP`.
   - **Armor**: The Pokemon's configured starting armor value.
   - **Starting Moves & Items**: The Pokemon's guaranteed base moves, plus one bonus move or consumable item based on the Pokedollars result.

7. **Battle & Rest Controls**:
   - **Start Battle**: Resets move uses for per-battle limited moves.
   - **End Battle**: Resets move uses for per-battle limited moves.
   - **Rest**: Fully restores HP to maximum and resets all expired move limits (both daily and per-battle).

8. **Move & Consumable Item Usage**:
   - **Consumable Items** (e.g. *Potion*, *Super Potion*, *Antidote*, *Awakening*, *Paralyze Heal*, *X Defend*, *Repel*): Ask whether the target is **Self** or **Other**. Using an item on *Self* modifies current HP/status, while using on *Other* applies the effect without changing the active character's HP. Once used, items are consumed and disabled until reset.
   - **Per-Battle Moves** (e.g. *Bubble*, *Bubblebeam*, *Psywave*, *Counter*, *Thunderbolt*): Have limited uses per battle. Reaching the limit alerts the player that it resets after the battle ends.
   - **Daily Moves** (e.g. *Cut*, *Surf*): Have limited uses per day. Reaching the limit alerts the player that it resets after a rest.
   - **Utility Moves** (e.g. *Dig*, *Strength*): Include utility descriptions for dungeon navigation or obstacle clearance alongside combat damage.

9. **Bench Pokémon Save Slots**:
   - Save up to 3 Pokémon characters to bench slots with local storage persistence.
   - Load saved characters to resume or manage them anytime.

## File Structure

- `index.html` - Main markup, character sheet layout, battle/rest buttons, and bench save slots UI
- `style.css` - Styling for types, move buttons, battle controls, item target selection, and bench slots
- `images/` - Image assets for Pokemon art (`nidoran-f.png`, `poliwag.png`, etc.)
- `js/` - Character creation logic, move execution, item target prompts, usage limit tracking, state persistence, and Pokemon lookup tables, split by concern:
  - `dom.js` - DOM element references
  - `state.js` - Shared mutable game state (current character, HP, move-use counters)
  - `data.js` - Static data tables (`pokemonTable`, `pokemonStartingData`, `moveTypes`, `abilityScoreLabels`)
  - `dice.js` - Dice-rolling utilities
  - `lookups.js` - Pure lookup helpers built on `data.js`
  - `moves.js` - Move/item execution logic (`useMove`)
  - `battle.js` - Battle/rest controls and move-use counter resets
  - `bench.js` - Bench save-slot persistence (localStorage)
  - `characterCreation.js` - Character creation flow and ability-score/main-attribute selection
  - `main.js` - Entry point; wires up event listeners

## Running Locally

This app uses native ES modules (`import`/`export`), which browsers block from
loading over the `file://` protocol. Serve the folder over HTTP instead of
opening `index.html` directly:

1. `npx serve .` (or `python3 -m http.server 8000`)
2. Open the printed URL (e.g. `http://localhost:3000` or `http://localhost:8000`) in your browser
3. Click "Create New Character" to begin!

## Customizing Pokemon

The Pokemon table is defined in `js/data.js` as `pokemonTable`. It's organized by ability type and score range:

```javascript
const pokemonTable = {
  strength: {
    "2-7": "Poliwag",
    "8": "Geodude",
    "9": "Machop",
    "10-11": "Squirtle",
    "12": "Dratini",
  },
  // ... dexterity and willpower follow the same pattern
};
```

Starter kits, base moves, and Pokedollar tier bonus options are configured under `pokemonStartingData`.
