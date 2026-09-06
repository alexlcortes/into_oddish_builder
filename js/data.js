export const abilityScoreLabels = {
  strength: "Strength",
  dexterity: "Dexterity",
  willpower: "Willpower",
};

// Pokemon table: indexed by main ability score, then by score range
export const pokemonTable = {
  strength: {
    "2-7": "Poliwag",
    "8": "Geodude",
    "9": "Machop",
    "10-11": "Squirtle",
    "12": "Dratini",
  },
  dexterity: {
    "2-7": "Weedle",
    "8": "Nidoran (F)",
    "9": "Pidgey",
    "10-11": "Charmander",
    "12": "Abra",
  },
  willpower: {
    "2-7": "Caterpie",
    "8": "Nidoran (M)",
    "9": "Oddish",
    "10-11": "Bulbasaur",
    "12": "Gastly",
  },
};

// Starting stats per Pokemon: HP dice, armor, guaranteed base moves, and a
// bonus move/item chosen by how many Pokedollars were rolled (ranges are
// inclusive). Set `consumable: true` when the bonus is an item (e.g. Potion,
// Antidote) rather than a battle move.
// Fill in the `null` entries as each Pokemon's starting kit is finalized.
export const pokemonStartingData = {
  // Strength
  Poliwag: {
    types: ["Water"],
    hpDice: "1d8",
    armor: 0,
    baseMoves: ["Bubble"],
    pokedollarBonus: [
      {min: 1, max: 1, name: "Psywave", consumable: false},
      {min: 2, max: 3, name: "Surf", consumable: false},
      {min: 4, max: 5, name: "Potion", consumable: true},
      {min: 6, max: 6, name: "Awakening", consumable: true},
    ],
  },
  Geodude: {
    types: ["Rock", "Ground"],
    hpDice: "1d6",
    armor: 2,
    baseMoves: ["Tackle"],
    pokedollarBonus: [
      {min: 1, max: 1, name: "Dig", consumable: false},
      {min: 2, max: 3, name: "Strength", consumable: false},
      {min: 4, max: 5, name: "Potion", consumable: true},
      {min: 6, max: 6, name: "X Defend", consumable: true},
    ],
  },
  Machop: {
    types: ["Fighting"],
    hpDice: "1d8",
    armor: 0,
    baseMoves: ["Karate Chop"],
    pokedollarBonus: [
      {min: 1, max: 1, name: "Counter", consumable: false},
      {min: 2, max: 3, name: "Strength", consumable: false},
      {min: 4, max: 5, name: "Potion", consumable: true},
      {min: 6, max: 6, name: "X Attack", consumable: true},
    ],
  },
  Squirtle: {
    types: ["Water"],
    hpDice: "1d6",
    armor: 1,
    baseMoves: ["Tackle", "Tail Whip"],
    pokedollarBonus: [
      {min: 1, max: 1, name: "Bubblebeam", consumable: false},
      {min: 2, max: 3, name: "Surf", consumable: false},
      {min: 4, max: 5, name: "Potion", consumable: true},
      {min: 6, max: 6, name: "X Defend", consumable: true},
    ],
  },
  Dratini: {
    types: ["Dragon"],
    hpDice: "1d4",
    armor: 0,
    baseMoves: ["Wrap", "Leer"],
    pokedollarBonus: [
      { min: 1, max: 1, name: "Thunderbolt", consumable: false },
      { min: 2, max: 3, name: "Surf", consumable: false },
      { min: 4, max: 5, name: "Potion", consumable: true },
      { min: 6, max: 6, name: "Paralyze Heal", consumable: true },
    ],
  },
  // Dexterity
  Weedle: {
    types: ["Bug", "Poison"],
    hpDice: "1d6",
    armor: 0,
    baseMoves: ["Poison Sting", "String Shot"],
    pokedollarBonus: [
      { min: 1, max: 1, name: "Super Potion", consumable: true },
      { min: 2, max: 3, name: "Potion", consumable: true },
      { min: 4, max: 5, name: "Antidote", consumable: true },
      { min: 6, max: 6, name: "Repel", consumable: true },
    ],
  },
  "Nidoran (F)": {
    types: ["Poison"],
    hpDice: "1d8",
    armor: 0,
    baseMoves: ["Tackle", "Leer"],
    pokedollarBonus: [
      { min: 1, max: 1, name: "Toxic", consumable: false },
      { min: 2, max: 3, name: "Strength", consumable: false },
      { min: 4, max: 5, name: "Potion", consumable: true },
      { min: 6, max: 6, name: "Antidote", consumable: true },
    ],
  },
  Pidgey: {
    types: ["Normal", "Flying"],
    hpDice: "1d8",
    armor: 0,
    baseMoves: ["Gust", "Sand-Attack"],
    pokedollarBonus: [
      { min: 1, max: 1, name: "Swift", consumable: false },
      { min: 2, max: 3, name: "Fly", consumable: false },
      { min: 4, max: 5, name: "Potion", consumable: true },
      { min: 6, max: 6, name: "Repel", consumable: true },
    ],
  },
  Charmander: {
    types: ["Fire"],
    hpDice: "1d6",
    armor: 0,
    baseMoves: ["Scratch", "Growl"],
    pokedollarBonus: [
      {min: 1, max: 1, name: "Dragon Rage", consumable: false},
      {min: 2, max: 3, name: "Strength", consumable: false},
      {min: 4, max: 5, name: "Potion", consumable: true},
      {min: 6, max: 6, name: "Burn Heal", consumable: true},
    ],
  },
  Abra: {
    types: ["Psychic"],
    hpDice: "1d4",
    armor: 0,
    baseMoves: ["Teleport"],
    pokedollarBonus: [
      {min: 1, max: 1, name: "Super Potion", consumable: true },
      {min: 2, max: 3, name: "Flash", consumable: false },
      {min: 4, max: 5, name: "Potion", consumable: true },
      {min: 6, max: 6, name: "Repel", consumable: true} ,
    ],
  },
  // Willpower
  Caterpie: {
    types: ["Bug"],
    hpDice: "1d8",
    armor: 0,
    baseMoves: ["Tackle", "String Shot"],
    pokedollarBonus: [
      { min: 1, max: 1, name: "Super Potion", consumable: true },
      { min: 2, max: 3, name: "Potion", consumable: true },
      { min: 4, max: 5, name: "Antidote", consumable: true },
      { min: 6, max: 6, name: "Repel", consumable: true },
    ],
  },
  "Nidoran (M)": {
    types: ["Poison"],
    hpDice: "1d8",
    armor: 0,
    baseMoves: ["Tackle", "Growl"],
    pokedollarBonus: [
      { min: 1, max: 1, name: "Toxic", consumable: false },
      { min: 2, max: 3, name: "Strength", consumable: false },
      { min: 4, max: 5, name: "Potion", consumable: true },
      { min: 6, max: 6, name: "Antidote", consumable: true },
    ],
  },
  Oddish: {
    types: ["Grass", "Poison"],
    hpDice: "1d6",
    armor: 0,
    baseMoves: ["Absorb"],
    pokedollarBonus: [
      { min: 1, max: 1, name: "Mega Drain", consumable: false },
      { min: 2, max: 3, name: "Cut", consumable: false },
      { min: 4, max: 5, name: "Potion", consumable: true },
      { min: 6, max: 6, name: "Awakening", consumable: true },
    ],
  },
  Bulbasaur: {
    types: ["Grass", "Poison"],
    hpDice: "1d6",
    armor: 0,
    baseMoves: ["Tackle", "Growl"],
    pokedollarBonus: [
      { min: 1, max: 1, name: "Mega Drain", consumable: false },
      { min: 2, max: 3, name: "Cut", consumable: false },
      { min: 4, max: 5, name: "Potion", consumable: true },
      { min: 6, max: 6, name: "Antidote", consumable: true },
    ],
  },
  Gastly: {
    types: ["Ghost", "Poison"],
    hpDice: "1d4",
    armor: 0,
    baseMoves: ["Lick", "Confuse Ray"],
    pokedollarBonus: [
      { min: 1, max: 1, name: "Super Potion", consumable: true },
      { min: 2, max: 3, name: "Potion", consumable: true },
      { min: 4, max: 5, name: "Antidote", consumable: true },
      { min: 6, max: 6, name: "Repel", consumable: true },
    ],
  },
};

// Maps each move with a confirmed type to its lowercase type name, used to
// color starting-move buttons via the existing `pokemon-type-*` CSS classes.
// Moves not listed here (e.g. unfinished bonus moves, consumable items) fall
// back to the default button styling.
export const moveTypes = {
  Bubble: "water",
  Tackle: "normal",
  "Karate Chop": "normal",
  "Tail Whip": "normal",
  Wrap: "normal",
  Leer: "normal",
  "Poison Sting": "poison",
  "String Shot": "bug",
  Gust: "normal",
  "Sand-Attack": "ground",
  Scratch: "normal",
  Growl: "normal",
  Teleport: "psychic",
  Absorb: "grass",
  Lick: "ghost",
  "Confuse Ray": "ghost",
  Psywave: "psychic",
  Surf: "water",
  Dig: "ground",
  Strength: "normal",
  Counter: "fighting",
  Bubblebeam: "water",
  Thunderbolt: "electric",
  Cut: "normal",
};
