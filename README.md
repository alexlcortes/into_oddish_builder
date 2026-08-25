# Pokemon Character Builder

A vanilla HTML/CSS/JavaScript web app for generating Pokemon character starter stats and assigning your starter Pokemon.

## How It Works

1. **Roll Ability Scores**: Click "Create New Character" to roll three ability scores using 2d6:
   - **Strength**: Fighting, fortitude, and toughness
   - **Dexterity**: Stealth, athletics, and reflexes
   - **Willpower**: Confidence, discipline, and charisma

2. **Optional Reroll**: Before choosing your main attribute, you can optionally reroll your lowest score.

3. **Choose Main Attribute**: If multiple scores tie for highest, select which will be your primary attribute. If there's a clear highest, it's automatically assigned.

4. **Get Your Pokemon**: Once your main attribute is locked in, the app determines your starter Pokemon based on:
   - Your **main ability type** (Strength, Dexterity, or Willpower)
   - Your **ability score** (ranges: 2-7, 8, 9, 10-11, 12)

5. **Pokedollars**: You also receive 1d6 Pokedollars as starting currency.

6. **Starting Pokemon Stats**: After your starter is determined, the app displays its starting kit:
  - **Hit Points**: Rolled from that Pokemon's configured hit point die and shown as current/max HP.
  - **Armor**: The Pokemon's configured starting armor value.
  - **Starting Moves**: The Pokemon's guaranteed base moves, plus one bonus move or consumable item based on the Pokedollars result.

  Bonus results use these Pokedollar ranges:
  - **1**: First configured bonus move or item
  - **2-3**: Second configured bonus move or item
  - **4-5**: Consumable item
  - **6**: Consumable item

## File Structure

- `index.html` - Main markup and page layout
- `script.js` - Character creation logic, dice rolling, Pokemon lookup, and Pokemon starting data
- `style.css` - Styling and layout (Grid-based ability score display)
- `images/` - Image assets (if any)

## Customizing Pokemon

The Pokemon table is defined in `script.js` as `pokemonTable`. It's organized by ability type and score range:

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

Edit the Pokemon names to customize which starter you receive for each combination of ability and score.

## Getting Started

Simply open `index.html` in a web browser and click "Create New Character" to begin!
