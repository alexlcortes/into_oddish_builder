const createCharacterBtn = document.getElementById("create-character-btn");
const abilityScoresPanel = document.getElementById("ability-scores-panel");
const mainAttributePrompt = document.getElementById("main-attribute-prompt");
const mainAttributeChoices = document.getElementById("main-attribute-choices");
const rerollPrompt = document.getElementById("reroll-prompt");
const rerollPromptText = document.getElementById("reroll-prompt-text");
const rerollChoices = document.getElementById("reroll-choices");

const abilityScoreElements = {
  strength: document.getElementById("ability-score-strength"),
  dexterity: document.getElementById("ability-score-dexterity"),
  willpower: document.getElementById("ability-score-willpower"),
};

const pokedollarsElement = document.getElementById("ability-score-pokedollars");
const pokemonResultDiv = document.getElementById("pokemon-result");
const pokemonNameElement = document.getElementById("pokemon-name");
const startingStatsDiv = document.getElementById("starting-stats");
const startingHpElement = document.getElementById("starting-hp");
const startingArmorElement = document.getElementById("starting-armor");
const startingMovesList = document.getElementById("starting-moves-list");
const startingStatsMissingElement = document.getElementById("starting-stats-missing");

const abilityScoreLabels = {
  strength: "Strength",
  dexterity: "Dexterity",
  willpower: "Willpower",
};

// Pokemon table: indexed by main ability score, then by score range
const pokemonTable = {
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
const pokemonStartingData = {
  // Strength
  Poliwag: {
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

let currentAbilityScores = null;

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function roll2d6() {
  return rollDie() + rollDie();
}

function roll1d6() {
  return rollDie();
}

function rollDice(count, sides) {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
}

function rollFromDiceNotation(diceNotation) {
  const [count, sides] = diceNotation.split("d").map(Number);
  return rollDice(count, sides);
}

function getPokedollarBonus(pokemonStartData, pokedollars) {
  const match = pokemonStartData.pokedollarBonus.find(
    ({ min, max }) => pokedollars >= min && pokedollars <= max
  );
  return match || null;
}

function getScoreRange(score) {
  if (score <= 7) return "2-7";
  if (score === 8) return "8";
  if (score === 9) return "9";
  if (score >= 10 && score <= 11) return "10-11";
  if (score === 12) return "12";
}

function getPokemon(mainAbility, score) {
  const range = getScoreRange(score);
  return pokemonTable[mainAbility][range];
}

function displayPokemon(mainAbility) {
  const score = currentAbilityScores[mainAbility];
  const pokemon = getPokemon(mainAbility, score);
  pokemonNameElement.textContent = pokemon;
  pokemonResultDiv.hidden = false;
  displayStartingStats(pokemon);
}

function displayStartingStats(pokemon) {
  const startData = pokemonStartingData[pokemon];

  if (!startData) {
    startingStatsDiv.hidden = true;
    startingStatsMissingElement.hidden = false;
    return;
  }

  startingStatsMissingElement.hidden = true;

  const pokedollars = Number(pokedollarsElement.textContent);
  const hp = rollFromDiceNotation(startData.hpDice);
  const bonus = getPokedollarBonus(startData, pokedollars);

  startingHpElement.textContent = `${hp}/${hp}`;
  startingArmorElement.textContent = startData.armor ?? 0;

  startingMovesList.innerHTML = "";
  for (const move of startData.baseMoves) {
    const listItem = document.createElement("li");
    listItem.textContent = move;
    startingMovesList.appendChild(listItem);
  }

  if (bonus) {
    const listItem = document.createElement("li");
    listItem.textContent = bonus.consumable ? `${bonus.name} (Consumable Item)` : bonus.name;
    startingMovesList.appendChild(listItem);
  }

  startingStatsDiv.hidden = false;
}

function renderAbilityScores() {
  for (const [abilityScoreName, value] of Object.entries(currentAbilityScores)) {
    abilityScoreElements[abilityScoreName].textContent = value;
  }
}

function highlightMainAttribute(abilityScoreName) {
  for (const element of Object.values(abilityScoreElements)) {
    element.classList.remove("ability-score-highest");
  }
  abilityScoreElements[abilityScoreName].classList.add("ability-score-highest");
  mainAttributePrompt.hidden = true;
  displayPokemon(abilityScoreName);
}

function promptForMainAttribute(tiedAbilityScoreNames) {
  mainAttributeChoices.innerHTML = "";

  for (const abilityScoreName of tiedAbilityScoreNames) {
    const button = document.createElement("button");
    button.textContent = abilityScoreLabels[abilityScoreName];
    button.addEventListener("click", () => highlightMainAttribute(abilityScoreName));
    mainAttributeChoices.appendChild(button);
  }

  mainAttributePrompt.hidden = false;
}

function chooseMainAttribute() {
  const highestScore = Math.max(...Object.values(currentAbilityScores));
  const tiedAbilityScoreNames = Object.entries(currentAbilityScores)
    .filter(([, value]) => value === highestScore)
    .map(([abilityScoreName]) => abilityScoreName);

  for (const element of Object.values(abilityScoreElements)) {
    element.classList.remove("ability-score-highest");
  }

  if (tiedAbilityScoreNames.length > 1) {
    promptForMainAttribute(tiedAbilityScoreNames);
  } else {
    mainAttributePrompt.hidden = true;
    abilityScoreElements[tiedAbilityScoreNames[0]].classList.add("ability-score-highest");
    displayPokemon(tiedAbilityScoreNames[0]);
  }
}

function rerollAbilityScore(abilityScoreName) {
  currentAbilityScores[abilityScoreName] = roll2d6();
  renderAbilityScores();
  rerollPrompt.hidden = true;
  chooseMainAttribute();
}

function keepAllAbilityScores() {
  rerollPrompt.hidden = true;
  chooseMainAttribute();
}

function promptForReroll() {
  const lowestScore = Math.min(...Object.values(currentAbilityScores));
  const tiedLowestAbilityScoreNames = Object.entries(currentAbilityScores)
    .filter(([, value]) => value === lowestScore)
    .map(([abilityScoreName]) => abilityScoreName);

  rerollPromptText.textContent = "Would you like to reroll your lowest score before choosing your main attribute?";
  rerollChoices.innerHTML = "";

  for (const abilityScoreName of tiedLowestAbilityScoreNames) {
    const button = document.createElement("button");
    button.textContent = `Reroll ${abilityScoreLabels[abilityScoreName]} (${lowestScore})`;
    button.addEventListener("click", () => rerollAbilityScore(abilityScoreName));
    rerollChoices.appendChild(button);
  }

  const keepButton = document.createElement("button");
  keepButton.textContent = "Keep All Scores";
  keepButton.addEventListener("click", keepAllAbilityScores);
  rerollChoices.appendChild(keepButton);

  rerollPrompt.hidden = false;
}

function createNewCharacter() {
  currentAbilityScores = {
    strength: roll2d6(),
    dexterity: roll2d6(),
    willpower: roll2d6(),
  };

  renderAbilityScores();
  pokedollarsElement.textContent = roll1d6();
  mainAttributePrompt.hidden = true;

  for (const element of Object.values(abilityScoreElements)) {
    element.classList.remove("ability-score-highest");
  }

  abilityScoresPanel.hidden = false;
  promptForReroll();
}

createCharacterBtn.addEventListener("click", createNewCharacter);
