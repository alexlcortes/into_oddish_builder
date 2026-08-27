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
const pokemonTypesElement = document.getElementById("pokemon-types");
const startingStatsDiv = document.getElementById("starting-stats");
const startingHpElement = document.getElementById("starting-hp");
const startingArmorElement = document.getElementById("starting-armor");
const startingMovesList = document.getElementById("starting-moves-list");
const startingStatsMissingElement = document.getElementById("starting-stats-missing");
const pokemonArtElement = document.getElementById("pokemon-art");
const savingThrowResultElement = document.getElementById("saving-throw-result");

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

let currentAbilityScores = null;
let currentPokemonHp = null;
let currentPokemonMaxHp = null;
let consumedMoveNames = new Set();

// Rolls a single six-sided die (1-6).
function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

// Rolls two six-sided dice and sums them (2-12) — used for ability scores.
function roll2d6() {
  return rollDie() + rollDie();
}

// Rolls a single six-sided die — used for starting Pokedollars.
function roll1d6() {
  return rollDie();
}

// Rolls a single twenty-sided die — used for ability score saving throws.
function roll1d20() {
  return rollDice(1, 20);
}

// Rolls `count` dice with `sides` faces each and returns the total.
function rollDice(count, sides) {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
}

// Parses a "NdM" string (e.g. "1d8") and rolls it via rollDice.
function rollFromDiceNotation(diceNotation) {
  const [count, sides] = diceNotation.split("d").map(Number);
  return rollDice(count, sides);
}

// Finds the pokedollarBonus entry whose min/max range contains the rolled
// Pokedollar amount, or null if the amount falls outside all ranges.
function getPokedollarBonus(pokemonStartData, pokedollars) {
  const match = pokemonStartData.pokedollarBonus.find(
    ({ min, max }) => pokedollars >= min && pokedollars <= max
  );
  return match || null;
}

// Buckets a raw 2-12 ability score into the range keys used by pokemonTable.
function getScoreRange(score) {
  if (score <= 7) return "2-7";
  if (score === 8) return "8";
  if (score === 9) return "9";
  if (score >= 10 && score <= 11) return "10-11";
  if (score === 12) return "12";
}

// Looks up which Pokemon corresponds to a main ability + its score.
function getPokemon(mainAbility, score) {
  const range = getScoreRange(score);
  return pokemonTable[mainAbility][range];
}

// Converts a Pokemon name into its image filename, e.g. "Nidoran (F)" ->
// "nidoran-f". Images live flat under /images, named by this slug.
function slugifyPokemonName(pokemon) {
  return pokemon
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/\s+/g, "-");
}

// Resolves and renders the Pokemon for the chosen main ability, then shows
// its starting stats.
function displayPokemon(mainAbility) {
  const score = currentAbilityScores[mainAbility];
  const pokemon = getPokemon(mainAbility, score);
  pokemonNameElement.textContent = pokemon;
  pokemonResultDiv.hidden = false;
  displayStartingStats(pokemon);
}

// Rolls HP and renders a Pokemon's starting HP, armor, base moves, and
// Pokedollar-tier bonus move/item. Falls back to a "missing data" notice
// for any Pokemon not yet filled in in pokemonStartingData.
function displayStartingStats(pokemon) {
  const startData = pokemonStartingData[pokemon];

  if (!startData) {
    startingStatsDiv.hidden = true;
    startingStatsMissingElement.hidden = false;
    return;
  }

  startingStatsMissingElement.hidden = true;
  pokemonTypesElement.innerHTML = "";
  for (const type of startData.types) {
    const typeElement = document.createElement("span");
    typeElement.classList.add("type-tag", `pokemon-type-${type.toLowerCase()}`);
    typeElement.textContent = type;
    pokemonTypesElement.appendChild(typeElement);
  }

  const pokedollars = Number(pokedollarsElement.textContent);
  const hp = rollFromDiceNotation(startData.hpDice);
  const bonus = getPokedollarBonus(startData, pokedollars);

  currentPokemonHp = hp;
  currentPokemonMaxHp = hp;
  startingHpElement.textContent = `${hp}/${hp}`;
  startingArmorElement.textContent = startData.armor ?? 0;

  consumedMoveNames.clear();
  startingMovesList.innerHTML = "";
  for (const move of startData.baseMoves) {
    const listItem = document.createElement("li");
    const moveButton = document.createElement("button");
    moveButton.type = "button";
    moveButton.textContent = move;
    moveButton.classList.add("starting-move-button");
    moveButton.addEventListener("click", () => useMove(move));
    listItem.appendChild(moveButton);
    startingMovesList.appendChild(listItem);
  }

  if (bonus) {
    const listItem = document.createElement("li");
    const moveButton = document.createElement("button");
    moveButton.type = "button";
    moveButton.textContent = bonus.consumable ? `${bonus.name} (Consumable Item)` : bonus.name;
    moveButton.classList.add("starting-move-button");
    if (bonus.consumable && consumedMoveNames.has(bonus.name)) {
      moveButton.disabled = true;
      moveButton.classList.add("starting-move-button-used");
    }
    moveButton.addEventListener("click", () => useMove(bonus.name));
    listItem.appendChild(moveButton);
    startingMovesList.appendChild(listItem);
  }

  // Hide the art until we know the image actually exists — not every
  // Pokemon has one yet.
  pokemonArtElement.hidden = true;
  pokemonArtElement.onerror = () => {
    pokemonArtElement.hidden = true;
  };
  pokemonArtElement.onload = () => {
    pokemonArtElement.hidden = false;
  };
  pokemonArtElement.alt = pokemon;
  pokemonArtElement.src = `images/${slugifyPokemonName(pokemon)}.png`;

  savingThrowResultElement.textContent = "";

  startingStatsDiv.hidden = false;
}

// Uses a basic move.
// Absorb deals a 1d4 hit and restores the same amount of HP, capped at the
// user's maximum HP. Tackle is a fixed 4-damage Normal-type move. Potion is a
// one-time consumable that heals 2d4 HP without a type.
function useMove(moveName) {
  const moveButtons = startingMovesList.querySelectorAll("button");
  const matchingButton = [...moveButtons].find((button) => button.textContent.startsWith(moveName));

  if (matchingButton && matchingButton.disabled) {
    return;
  }

  if (moveName === "Absorb") {
    const damageDealt = rollDice(1, 4);
    const healAmount = Math.min(damageDealt, currentPokemonMaxHp - currentPokemonHp);
    currentPokemonHp = Math.min(currentPokemonMaxHp, currentPokemonHp + healAmount);
    startingHpElement.textContent = `${currentPokemonHp}/${currentPokemonMaxHp}`;

    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-grass">Grass</span> type move. You deal ${damageDealt} HP and heal ${healAmount} HP.`;
    return;
  }

  if (moveName === "Tackle") {
    const damageDealt = 4;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-normal">Normal</span> type move. You deal ${damageDealt} HP.`;
    return;
  }

  if (moveName === "Potion") {
    const healAmount = Math.min(rollDice(2, 4), currentPokemonMaxHp - currentPokemonHp);
    currentPokemonHp = Math.min(currentPokemonMaxHp, currentPokemonHp + healAmount);
    startingHpElement.textContent = `${currentPokemonHp}/${currentPokemonMaxHp}`;

    consumedMoveNames.add(moveName);
    if (matchingButton) {
      matchingButton.disabled = true;
      matchingButton.classList.add("starting-move-button-used");
    }

    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. It heals ${healAmount} HP.`;
    return;
  }

  if (moveName === "Antidote") {
    consumedMoveNames.add(moveName);
    if (matchingButton) {
      matchingButton.disabled = true;
      matchingButton.classList.add("starting-move-button-used");
    }

    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. You have cleared your <strong>POISON</strong> status.`;
    return;
  }

  if (moveName === "Repel") {
    consumedMoveNames.add(moveName);
    if (matchingButton) {
      matchingButton.disabled = true;
      matchingButton.classList.add("starting-move-button-used");
    }

    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. Enemy Pokémon have disadvantage on morale saves for one day.`;
    return;
  }

  if (moveName === "Strength") {
    const damageDealt = rollDice(1, 8);
    consumedMoveNames.add(moveName);
    if (matchingButton) {
      matchingButton.disabled = true;
      matchingButton.classList.add("starting-move-button-used");
    }

    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-normal">Normal</span> type move. You deal ${damageDealt} HP to the target. It can also move travel-blocking boulders.`;
    return;
  }

  savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>.`;
}

// Rolls a 1d20 saving throw against an ability score. Success is rolling
// at or under the score, matching the tabletop convention this builder
// follows for ability checks.
function performSavingThrow(abilityScoreName) {
  const score = currentAbilityScores[abilityScoreName];
  const roll = roll1d20();
  const success = roll <= score;
  const label = abilityScoreLabels[abilityScoreName];
  savingThrowResultElement.textContent = `You scored a (${roll}) on your ${label} save.  You ${success ? "succeeded!!!" : "failed..."}`;
}

// Writes the current ability score values into their DOM elements.
function renderAbilityScores() {
  for (const [abilityScoreName, value] of Object.entries(currentAbilityScores)) {
    abilityScoreElements[abilityScoreName].textContent = value;
  }
}

// Handles the user's manual pick when multiple ability scores were tied for
// highest: marks it highlighted, hides the tie-breaker prompt, and reveals
// the resulting Pokemon.
function highlightMainAttribute(abilityScoreName) {
  for (const element of Object.values(abilityScoreElements)) {
    element.classList.remove("ability-score-highest");
  }
  abilityScoreElements[abilityScoreName].classList.add("ability-score-highest");
  mainAttributePrompt.hidden = true;
  displayPokemon(abilityScoreName);
}

// Renders one choice button per tied ability score so the user can break
// the tie for main attribute.
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

// Determines the main attribute from the highest ability score. If there's
// a single highest score it's chosen automatically; if scores are tied, the
// user is prompted to pick one.
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

// Re-rolls one ability score in place, re-renders scores, and proceeds to
// choosing the main attribute.
function rerollAbilityScore(abilityScoreName) {
  currentAbilityScores[abilityScoreName] = roll2d6();
  renderAbilityScores();
  rerollPrompt.hidden = true;
  chooseMainAttribute();
}

// User declined to reroll: proceed straight to choosing the main attribute.
function keepAllAbilityScores() {
  rerollPrompt.hidden = true;
  chooseMainAttribute();
}

// Offers a reroll for each ability score tied for lowest, plus a "keep all"
// option, before the main attribute is chosen.
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

// Entry point for the "Create Character" button: rolls fresh ability
// scores and starting Pokedollars, resets prior selections/UI state, and
// kicks off the reroll prompt.
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

  // Clear any previously rolled Pokemon so it doesn't linger on screen
  // while the new character goes through reroll/main-attribute selection.
  consumedMoveNames.clear();
  pokemonResultDiv.hidden = true;
  pokemonNameElement.textContent = "";
  pokemonTypesElement.innerHTML = "";
  startingStatsDiv.hidden = true;
  startingStatsMissingElement.hidden = true;
  startingMovesList.innerHTML = "";
  pokemonArtElement.hidden = true;
  pokemonArtElement.src = "";
  savingThrowResultElement.textContent = "";

  abilityScoresPanel.hidden = false;
  promptForReroll();
}

createCharacterBtn.addEventListener("click", createNewCharacter);

for (const [abilityScoreName, element] of Object.entries(abilityScoreElements)) {
  element.addEventListener("click", () => performSavingThrow(abilityScoreName));
}
