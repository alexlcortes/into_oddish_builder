import { pokemonTable, pokemonStartingData, moveTypes } from "./data.js";

// Returns the `pokemon-type-*` CSS class for a move's type, or null if the
// move has no confirmed type yet.
export function getMoveTypeClass(moveName) {
  const type = moveTypes[moveName];
  return type ? `pokemon-type-${type}` : null;
}

// Finds the pokedollarBonus entry whose min/max range contains the rolled
// Pokedollar amount, or null if the amount falls outside all ranges.
export function getPokedollarBonus(pokemonStartData, pokedollars) {
  const match = pokemonStartData.pokedollarBonus.find(
    ({ min, max }) => pokedollars >= min && pokedollars <= max
  );
  return match || null;
}

// Determines if a move name corresponds to a consumable item.
export function isConsumableItem(moveName) {
  const knownConsumables = [
    "Potion", "Super Potion", "Antidote", "Awakening",
    "Paralyze Heal", "Burn Heal", "Repel", "X Defend", "X Attack"
  ];
  if (knownConsumables.includes(moveName)) {
    return true;
  }

  for (const pokemon of Object.values(pokemonStartingData)) {
    for (const bonus of pokemon.pokedollarBonus || []) {
      if (bonus.name === moveName && bonus.consumable) {
        return true;
      }
    }
  }
  return false;
}

// Buckets a raw 2-12 ability score into the range keys used by pokemonTable.
export function getScoreRange(score) {
  if (score <= 7) return "2-7";
  if (score === 8) return "8";
  if (score === 9) return "9";
  if (score >= 10 && score <= 11) return "10-11";
  if (score === 12) return "12";
}

// Looks up which Pokemon corresponds to a main ability + its score.
export function getPokemon(mainAbility, score) {
  const range = getScoreRange(score);
  return pokemonTable[mainAbility][range];
}

// Converts a Pokemon name into its image filename, e.g. "Nidoran (F)" ->
// "nidoran-f". Images live flat under /images, named by this slug.
export function slugifyPokemonName(pokemon) {
  return pokemon
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/\s+/g, "-");
}
