// Rolls a single six-sided die (1-6).
export function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

// Rolls two six-sided dice and sums them (2-12) — used for ability scores.
export function roll2d6() {
  return rollDie() + rollDie();
}

// Rolls a single six-sided die — used for starting Pokedollars.
export function roll1d6() {
  return rollDie();
}

// Rolls a single twenty-sided die — used for ability score saving throws.
export function roll1d20() {
  return rollDice(1, 20);
}

// Rolls `count` dice with `sides` faces each and returns the total.
export function rollDice(count, sides) {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
}

// Parses a "NdM" string (e.g. "1d8") and rolls it via rollDice.
export function rollFromDiceNotation(diceNotation) {
  const [count, sides] = diceNotation.split("d").map(Number);
  return rollDice(count, sides);
}
