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
const startBattleBtn = document.getElementById("start-battle-btn");
const endBattleBtn = document.getElementById("end-battle-btn");
const restBtn = document.getElementById("rest-btn");
const pokemonArtElement = document.getElementById("pokemon-art");
const savingThrowResultElement = document.getElementById("saving-throw-result");
const saveSlotsList = document.getElementById("save-slots-list");

const SAVE_KEY = "oddish-builder-saves";
const saveSlots = loadSaveSlots();
let selectedMainAbility = null;

const abilityScoreLabels = {
  strength: "Strength",
  dexterity: "Dexterity",
  willpower: "Willpower",
};

function getDefaultSaveSlots() {
  return [null, null, null];
}

function loadSaveSlots() {
  try {
    const rawValue = localStorage.getItem(SAVE_KEY);
    if (!rawValue) {
      return getDefaultSaveSlots();
    }

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed) || parsed.length !== 3) {
      return getDefaultSaveSlots();
    }

    return parsed.map((slot) => (slot && typeof slot === "object" ? slot : null));
  } catch (error) {
    console.warn("Unable to load save slots:", error);
    return getDefaultSaveSlots();
  }
}

function persistSaveSlots() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(saveSlots));
  renderSaveSlots();
}

function buildCharacterSnapshot() {
  if (!currentAbilityScores || !selectedMainAbility) {
    return null;
  }

  const selectedPokemon = pokemonNameElement.textContent || getPokemon(selectedMainAbility, currentAbilityScores[selectedMainAbility]);
  const startData = pokemonStartingData[selectedPokemon];
  const bonusMove = startData ? getPokedollarBonus(startData, Number(pokedollarsElement.textContent)) : null;

  return {
    pokemon: selectedPokemon,
    mainAbility: selectedMainAbility,
    abilityScores: {
      ...currentAbilityScores,
    },
    pokedollars: Number(pokedollarsElement.textContent) || 0,
    hp: {
      current: Number(currentPokemonHp) || 0,
      max: Number(currentPokemonMaxHp) || 0,
    },
    armor: Number(startingArmorElement.textContent) || 0,
    baseMoves: startData ? [...startData.baseMoves] : [],
    bonusMove: bonusMove ? bonusMove.name : null,
    bonusMoveType: bonusMove ? (bonusMove.consumable ? "item" : "move") : null,
    types: startData ? [...startData.types] : [],
    imageSlug: slugifyPokemonName(selectedPokemon),
    savedAt: new Date().toISOString(),
  };
}

function renderSavedCharacter(slotData) {
  if (!slotData) {
    pokemonResultDiv.hidden = true;
    startingStatsDiv.hidden = true;
    startingStatsMissingElement.hidden = true;
    return;
  }

  currentAbilityScores = { ...slotData.abilityScores };
  selectedMainAbility = slotData.mainAbility || Object.keys(currentAbilityScores).sort((a, b) => currentAbilityScores[b] - currentAbilityScores[a])[0];

  renderAbilityScores();
  pokedollarsElement.textContent = slotData.pokedollars;
  pokemonNameElement.textContent = slotData.pokemon;
  pokemonResultDiv.hidden = false;

  const savedTypes = slotData.types || [];
  pokemonTypesElement.innerHTML = "";
  for (const type of savedTypes) {
    const typeElement = document.createElement("span");
    typeElement.classList.add("type-tag", `pokemon-type-${type.toLowerCase()}`);
    typeElement.textContent = type;
    pokemonTypesElement.appendChild(typeElement);
  }

  currentPokemonHp = Number(slotData.hp.current) || 0;
  currentPokemonMaxHp = Number(slotData.hp.max) || currentPokemonHp;
  startingHpElement.textContent = `${currentPokemonHp}/${currentPokemonMaxHp}`;
  startingArmorElement.textContent = slotData.armor ?? 0;

  const typesList = slotData.types || [];
  const startData = pokemonStartingData[slotData.pokemon];
  consumedMoveNames.clear();
  resetDailyMoveUses();
  startingMovesList.innerHTML = "";

  for (const move of startData ? startData.baseMoves : []) {
    const listItem = document.createElement("li");
    const moveButton = document.createElement("button");
    moveButton.type = "button";
    moveButton.textContent = move;
    moveButton.classList.add("starting-move-button");
    const baseMoveTypeClass = getMoveTypeClass(move);
    if (baseMoveTypeClass) {
      moveButton.classList.add(baseMoveTypeClass);
    }
    moveButton.addEventListener("click", () => useMove(move));
    listItem.appendChild(moveButton);
    startingMovesList.appendChild(listItem);
  }

  if (slotData.bonusMove) {
    const listItem = document.createElement("li");
    const moveButton = document.createElement("button");
    moveButton.type = "button";
    moveButton.textContent = slotData.bonusMoveType === "item" ? `${slotData.bonusMove} (Consumable Item)` : slotData.bonusMove;
    moveButton.classList.add("starting-move-button");
    const bonusMoveTypeClass = getMoveTypeClass(slotData.bonusMove);
    if (bonusMoveTypeClass) {
      moveButton.classList.add(bonusMoveTypeClass);
    }
    moveButton.addEventListener("click", () => useMove(slotData.bonusMove));
    listItem.appendChild(moveButton);
    startingMovesList.appendChild(listItem);
  }

  for (const element of Object.values(abilityScoreElements)) {
    element.classList.remove("ability-score-highest");
  }
  if (selectedMainAbility && abilityScoreElements[selectedMainAbility]) {
    abilityScoreElements[selectedMainAbility].classList.add("ability-score-highest");
  }

  startingStatsDiv.hidden = false;
  startingStatsMissingElement.hidden = true;
  pokemonArtElement.hidden = true;
  pokemonArtElement.onerror = () => {
    pokemonArtElement.hidden = true;
  };
  pokemonArtElement.onload = () => {
    pokemonArtElement.hidden = false;
  };
  pokemonArtElement.alt = slotData.pokemon;
  pokemonArtElement.src = `images/${slotData.imageSlug || slugifyPokemonName(slotData.pokemon)}.png`;
  savingThrowResultElement.textContent = "";
}

function saveCurrentCharacter(slotIndex) {
  if (!currentAbilityScores || !selectedMainAbility) {
    return;
  }

  const snapshot = buildCharacterSnapshot();
  if (!snapshot) {
    return;
  }

  if (saveSlots[slotIndex] && !window.confirm("Overwrite this saved Pokémon?")) {
    return;
  }

  saveSlots[slotIndex] = snapshot;
  persistSaveSlots();
}

function loadSavedCharacter(slotIndex) {
  const slotData = saveSlots[slotIndex];
  if (!slotData) {
    return;
  }

  renderSavedCharacter(slotData);
  renderSaveSlots();
}

function clearSingleSaveSlot(slotIndex) {
  const slot = saveSlots[slotIndex];
  if (!slot) {
    return;
  }

  const confirmClear = window.confirm(`Remove ${slot.pokemon} from bench slot ${slotIndex + 1}?`);
  if (!confirmClear) {
    return;
  }

  saveSlots[slotIndex] = null;
  persistSaveSlots();
}

function renderSaveSlots() {
  saveSlotsList.innerHTML = "";

  saveSlots.forEach((slot, index) => {
    const card = document.createElement("div");
    card.className = "save-slot-card";

    if (slot) {
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "save-slot-remove";
      removeButton.title = `Remove ${slot.pokemon}`;
      removeButton.textContent = "×";
      removeButton.setAttribute("aria-label", `Remove ${slot.pokemon} from slot ${index + 1}`);
      removeButton.addEventListener("click", () => clearSingleSaveSlot(index));
      card.appendChild(removeButton);
    }

    const header = document.createElement("div");
    header.className = "save-slot-header";

    const title = document.createElement("h3");
    title.textContent = `Slot ${index + 1}`;

    header.appendChild(title);
    card.appendChild(header);

    const preview = document.createElement("div");
    preview.className = "save-slot-preview";

    if (slot) {
      const art = document.createElement("img");
      art.src = `images/${slot.imageSlug || slugifyPokemonName(slot.pokemon)}.png`;
      art.alt = slot.pokemon;
      art.onerror = () => {
        art.hidden = true;
      };
      preview.appendChild(art);

      const name = document.createElement("p");
      name.className = "save-slot-name";
      name.textContent = slot.pokemon;
      preview.appendChild(name);
    } else {
      const emptyState = document.createElement("p");
      emptyState.className = "save-slot-name";
      emptyState.textContent = "Empty";
      preview.appendChild(emptyState);
    }

    card.appendChild(preview);

    if (slot) {
      const summary = document.createElement("p");
      summary.className = "save-slot-summary";
      summary.textContent = `${slot.mainAbility ? abilityScoreLabels[slot.mainAbility] : "Main attribute"} · ${slot.abilityScores[slot.mainAbility] ?? ""}`;
      card.appendChild(summary);
    }

    const actions = document.createElement("div");
    actions.className = "save-slot-actions";

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "save-slot-button primary";
    saveButton.textContent = slot ? "Save Over" : "Save";
    saveButton.addEventListener("click", () => saveCurrentCharacter(index));
    actions.appendChild(saveButton);

    const loadButton = document.createElement("button");
    loadButton.type = "button";
    loadButton.className = "save-slot-button";
    loadButton.textContent = slot ? "Load" : "Empty";
    loadButton.disabled = !slot;
    loadButton.addEventListener("click", () => loadSavedCharacter(index));
    actions.appendChild(loadButton);

    card.appendChild(actions);
    saveSlotsList.appendChild(card);
  });
}

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

// Maps each move with a confirmed type to its lowercase type name, used to
// color starting-move buttons via the existing `pokemon-type-*` CSS classes.
// Moves not listed here (e.g. unfinished bonus moves, consumable items) fall
// back to the default button styling.
const moveTypes = {
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

// Returns the `pokemon-type-*` CSS class for a move's type, or null if the
// move has no confirmed type yet.
function getMoveTypeClass(moveName) {
  const type = moveTypes[moveName];
  return type ? `pokemon-type-${type}` : null;
}

// Usage counters for limited daily moves (reset after rest)
let cutUsesUsedToday = 0;
let surfUsesUsedToday = 0;
let tailWhipUsesUsedToday = 0;
let teleportUsesUsedToday = 0;
let confuseRayUsesUsedToday = 0;
let strengthUsesUsedToday = 0;

// Usage counters for limited per-battle moves (reset when battle starts/ends or after rest)
let bubbleUsesUsedThisBattle = 0;
let psywaveUsesUsedThisBattle = 0;
let counterUsesUsedThisBattle = 0;
let bubblebeamUsesUsedThisBattle = 0;
let thunderboltUsesUsedThisBattle = 0;
let karateChopUsesUsedThisBattle = 0;
let wrapUsesUsedThisBattle = 0;
let lickUsesUsedThisBattle = 0;
let leerUsesUsedThisBattle = 0;
let sandAttackUsesUsedThisBattle = 0;

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

// Determines if a move name corresponds to a consumable item.
function isConsumableItem(moveName) {
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
  selectedMainAbility = mainAbility;
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
  resetDailyMoveUses();
  startingMovesList.innerHTML = "";
  for (const move of startData.baseMoves) {
    const listItem = document.createElement("li");
    const moveButton = document.createElement("button");
    moveButton.type = "button";
    moveButton.textContent = move;
    moveButton.classList.add("starting-move-button");
    const baseMoveTypeClass = getMoveTypeClass(move);
    if (baseMoveTypeClass) {
      moveButton.classList.add(baseMoveTypeClass);
    }
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
    const bonusMoveTypeClass = getMoveTypeClass(bonus.name);
    if (bonusMoveTypeClass) {
      moveButton.classList.add(bonusMoveTypeClass);
    }
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

// Executes a Pokémon move or consumable item action. Handles target selection
// (Self/Other) for consumable items, enforces daily & battle usage limits,
// updates HP/status accordingly, and renders the result to the log.
function useMove(moveName, targetChoice = null) {
  const moveButtons = startingMovesList.querySelectorAll("button");
  const matchingButton = [...moveButtons].find((button) => button.textContent.startsWith(moveName));

  if (matchingButton && matchingButton.disabled) {
    return;
  }

  if (isConsumableItem(moveName) && !targetChoice) {
    savingThrowResultElement.innerHTML = `
      <p>Target for <strong>${moveName.toUpperCase()}</strong>:</p>
      <div class="target-choices">
        <button type="button" class="target-choice-btn" id="target-choice-self">Self</button>
        <button type="button" class="target-choice-btn" id="target-choice-other">Other</button>
      </div>
    `;

    document.getElementById("target-choice-self").addEventListener("click", () => useMove(moveName, "self"));
    document.getElementById("target-choice-other").addEventListener("click", () => useMove(moveName, "other"));
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

  if (moveName === "Poison Sting") {
    const damageDealt = rollDice(1, 4);
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-poison">Poison</span> type move. You deal ${damageDealt} damage to the target. This move can be used an unlimited number of times.`;
    return;
  }

  if (moveName === "Tackle") {
    const damageDealt = 4;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-normal">Normal</span> type move. You deal ${damageDealt} HP.`;
    return;
  }

  if (moveName === "Karate Chop") {
    if (karateChopUsesUsedThisBattle >= 2) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 2 times this battle. It resets after battle ends.`;
      return;
    }

    const roll = rollDice(1, 6);
    const isCritical = roll >= 5;
    const damageDealt = isCritical ? roll + rollDice(1, 6) : roll;
    karateChopUsesUsedThisBattle += 1;
    const remainingUses = 2 - karateChopUsesUsedThisBattle;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-normal">Normal</span> type move. You deal ${damageDealt} damage to the target${isCritical ? " (critical hit!)" : ""}. ${remainingUses} use${remainingUses === 1 ? "" : "s"} remaining this battle.`;
    return;
  }

  if (moveName === "Tail Whip") {
    if (tailWhipUsesUsedToday >= 3) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 3 times today. It resets after a rest.`;
      return;
    }

    tailWhipUsesUsedToday += 1;
    const remainingUses = 3 - tailWhipUsesUsedToday;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-normal">Normal</span> type move. Target's Armor is reduced by 1 for the rest of the battle. ${remainingUses} use${remainingUses === 1 ? "" : "s"} remaining today.`;
    return;
  }

  if (moveName === "Wrap") {
    if (wrapUsesUsedThisBattle >= 2) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 2 times this battle. It resets after battle ends.`;
      return;
    }

    const turnsBound = rollDice(1, 4);
    const damageDealt = rollDice(1, 4);
    wrapUsesUsedThisBattle += 1;
    const remainingUses = 2 - wrapUsesUsedThisBattle;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-normal">Normal</span> type move. You must spend the next ${turnsBound} turn${turnsBound === 1 ? "" : "s"} attacking the same target, unless it faints. Target takes ${damageDealt} damage this turn and is immobilized. ${remainingUses} use${remainingUses === 1 ? "" : "s"} remaining this battle.`;
    return;
  }

  if (moveName === "Teleport") {
    if (teleportUsesUsedToday >= 2) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 2 times today. It resets after a rest.`;
      return;
    }

    teleportUsesUsedToday += 1;
    const remainingUses = 2 - teleportUsesUsedToday;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-psychic">Psychic</span> type move. You and up to six other Pokémon are teleported to the last Pokémon Center you visited. ${remainingUses} use${remainingUses === 1 ? "" : "s"} remaining today.`;
    return;
  }

  if (moveName === "String Shot") {
    const roll = roll1d20();
    const success = roll >= 2;
    const detail = success
      ? "Target has disadvantage on all Dexterity saves until they pass a Dexterity save."
      : "The target resists the effect.";
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-bug">Bug</span> type move. You roll a (${roll}) on 1d20. ${detail} This move can be used an unlimited number of times.`;
    return;
  }

  if (moveName === "Scratch") {
    const damageDealt = rollDice(1, 4);
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-normal">Normal</span> type move. You deal ${damageDealt} damage to the target. This move can be used an unlimited number of times.`;
    return;
  }

  if (moveName === "Lick") {
    if (lickUsesUsedThisBattle >= 3) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 3 times this battle. It resets after battle ends.`;
      return;
    }

    const roll = rollDice(1, 4);
    const isCritical = roll === 4;
    const damageDealt = isCritical ? roll + rollDice(1, 4) : roll;
    lickUsesUsedThisBattle += 1;
    const remainingUses = 3 - lickUsesUsedThisBattle;
    const criticalDetail = isCritical ? ` Critical hit! Target suffers the <strong>PARALYZE</strong> status.` : "";
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-ghost">Ghost</span> type move. You deal ${damageDealt} damage to the target.${criticalDetail} Psychic-type Pokémon are immune to this attack. ${remainingUses} use${remainingUses === 1 ? "" : "s"} remaining this battle.`;
    return;
  }

  if (moveName === "Leer") {
    if (leerUsesUsedThisBattle >= 3) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 3 times this battle. It resets after battle ends.`;
      return;
    }

    leerUsesUsedThisBattle += 1;
    const remainingUses = 3 - leerUsesUsedThisBattle;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-normal">Normal</span> type move. Target's Armor is reduced by 1 for the remainder of the battle. ${remainingUses} use${remainingUses === 1 ? "" : "s"} remaining this battle.`;
    return;
  }

  if (moveName === "Gust") {
    const damageDealt = rollDice(1, 4);
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-normal">Normal</span> type move. You deal ${damageDealt} damage to the target. This move can be used an unlimited number of times.`;
    return;
  }

  if (moveName === "Growl") {
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-normal">Normal</span> type move. Target's attacks are impaired for the remainder of the battle. This move can be used an unlimited number of times.`;
    return;
  }

  if (moveName === "Confuse Ray") {
    if (confuseRayUsesUsedToday >= 1) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 1 time today. It resets after a rest.`;
      return;
    }

    const confusionTurns = rollDice(1, 4);
    confuseRayUsesUsedToday += 1;
    const remainingUses = 1 - confuseRayUsesUsedToday;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-ghost">Ghost</span> type move. Target suffers the <strong>CONFUSION</strong> status for ${confusionTurns} turn${confusionTurns === 1 ? "" : "s"}. While confused, the target must make a Willpower save each turn or take 1d6 damage injuring themselves. ${remainingUses} use remaining today.`;
    return;
  }

  if (moveName === "Sand-Attack") {
    if (sandAttackUsesUsedThisBattle >= 1) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 1 time this battle. It resets after battle ends.`;
      return;
    }

    sandAttackUsesUsedThisBattle += 1;
    const remainingUses = 1 - sandAttackUsesUsedThisBattle;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-ground">Ground</span> type move. Target's Accuracy is lowered by 1 stage for the remainder of the battle, dropping their damage die down one size (e.g. 1d6 becomes 1d4). ${remainingUses} use remaining this battle.`;
    return;
  }

  if (moveName === "Potion") {
    consumedMoveNames.add(moveName);
    if (matchingButton) {
      matchingButton.disabled = true;
      matchingButton.classList.add("starting-move-button-used");
    }

    const rawHeal = rollDice(2, 4);
    const targetLabel = targetChoice === "other" ? "another Pokémon" : "yourself";
    if (targetChoice === "other") {
      savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong> on <strong>${targetLabel}</strong>. It heals ${rawHeal} HP.`;
    } else {
      const healAmount = Math.min(rawHeal, currentPokemonMaxHp - currentPokemonHp);
      currentPokemonHp = Math.min(currentPokemonMaxHp, currentPokemonHp + healAmount);
      startingHpElement.textContent = `${currentPokemonHp}/${currentPokemonMaxHp}`;
      savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong> on <strong>${targetLabel}</strong>. It heals ${healAmount} HP.`;
    }
    return;
  }

  if (moveName === "Super Potion") {
    consumedMoveNames.add(moveName);
    if (matchingButton) {
      matchingButton.disabled = true;
      matchingButton.classList.add("starting-move-button-used");
    }

    const rawHeal = rollDice(2, 8);
    const targetLabel = targetChoice === "other" ? "another Pokémon" : "yourself";
    if (targetChoice === "other") {
      savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong> on <strong>${targetLabel}</strong>. It heals ${rawHeal} HP.`;
    } else {
      const healAmount = Math.min(rawHeal, currentPokemonMaxHp - currentPokemonHp);
      currentPokemonHp = Math.min(currentPokemonMaxHp, currentPokemonHp + healAmount);
      startingHpElement.textContent = `${currentPokemonHp}/${currentPokemonMaxHp}`;
      savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong> on <strong>${targetLabel}</strong>. It heals ${healAmount} HP.`;
    }
    return;
  }

  if (moveName === "Antidote") {
    consumedMoveNames.add(moveName);
    if (matchingButton) {
      matchingButton.disabled = true;
      matchingButton.classList.add("starting-move-button-used");
    }

    const targetLabel = targetChoice === "other" ? "another Pokémon" : "yourself";
    const detail = targetChoice === "other" ? "Target's <strong>POISON</strong> status has been cleared." : "You have cleared your <strong>POISON</strong> status.";
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong> on <strong>${targetLabel}</strong>. ${detail}`;
    return;
  }

  if (moveName === "Awakening") {
    consumedMoveNames.add(moveName);
    if (matchingButton) {
      matchingButton.disabled = true;
      matchingButton.classList.add("starting-move-button-used");
    }

    const targetLabel = targetChoice === "other" ? "another Pokémon" : "yourself";
    const detail = targetChoice === "other" ? "Target is cured from <strong>SLEEP</strong> status." : "You are cured from <strong>SLEEP</strong> status.";
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong> on <strong>${targetLabel}</strong>. ${detail}`;
    return;
  }

  if (moveName === "Paralyze Heal") {
    consumedMoveNames.add(moveName);
    if (matchingButton) {
      matchingButton.disabled = true;
      matchingButton.classList.add("starting-move-button-used");
    }

    const targetLabel = targetChoice === "other" ? "another Pokémon" : "yourself";
    const detail = targetChoice === "other" ? "Target's <strong>PARALYZE</strong> status has been cured." : "You have cured your <strong>PARALYZE</strong> status.";
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong> on <strong>${targetLabel}</strong>. ${detail}`;
    return;
  }

  if (moveName === "X Defend") {
    consumedMoveNames.add(moveName);
    if (matchingButton) {
      matchingButton.disabled = true;
      matchingButton.classList.add("starting-move-button-used");
    }

    const targetLabel = targetChoice === "other" ? "another Pokémon" : "yourself";
    const detail = targetChoice === "other" ? "Increases Armor for the target's next incoming attack." : "Increases Armor for your next incoming attack.";
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong> on <strong>${targetLabel}</strong>. ${detail}`;
    return;
  }

  if (moveName === "Repel") {
    consumedMoveNames.add(moveName);
    if (matchingButton) {
      matchingButton.disabled = true;
      matchingButton.classList.add("starting-move-button-used");
    }

    const targetLabel = targetChoice === "other" ? "another Pokémon" : "yourself";
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong> on <strong>${targetLabel}</strong>. Enemy Pokémon have disadvantage on morale saves for one day.`;
    return;
  }

  if (moveName === "Strength") {
    if (strengthUsesUsedToday >= 1) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 1 time today. It resets after a rest.`;
      return;
    }

    const damageDealt = rollDice(1, 8);
    strengthUsesUsedToday += 1;
    const remainingUses = 1 - strengthUsesUsedToday;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-normal">Normal</span> type move. You deal ${damageDealt} HP to the target. It can also move travel-blocking boulders. ${remainingUses} use remaining today.`;
    return;
  }

  if (moveName === "Dig") {
    const damageDealt = rollDice(1, 10);
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-ground">Ground</span> type move. You dig underground, evading the next attack. On your next turn, you emerge and deal ${damageDealt} HP damage to the target. Can also dig a path to a lower level of the dungeon.`;
    return;
  }

  if (moveName === "Cut") {
    if (cutUsesUsedToday >= 3) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 3 times today. It resets after a rest.`;
      return;
    }

    const damageDealt = rollDice(1, 6);
    cutUsesUsedToday += 1;
    const remainingUses = 3 - cutUsesUsedToday;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-normal">Normal</span> type move. You deal ${damageDealt} damage to the target. Can also cut a path in the forest by clearing foliage. ${remainingUses} use${remainingUses === 1 ? "" : "s"} remaining today.`;
    return;
  }

  if (moveName === "Bubble") {
    if (bubbleUsesUsedThisBattle >= 3) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 3 times this battle. It resets after battle ends.`;
      return;
    }

    const damageDealt = rollDice(1, 4);
    bubbleUsesUsedThisBattle += 1;
    const remainingUses = 3 - bubbleUsesUsedThisBattle;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-water">Water</span> type move. You deal ${damageDealt} blast damage. Target has disadvantage on Dexterity saves until they pass a Dexterity save. ${remainingUses} use${remainingUses === 1 ? "" : "s"} remaining this battle.`;
    return;
  }

  if (moveName === "Bubblebeam") {
    if (bubblebeamUsesUsedThisBattle >= 2) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 2 times this battle. It resets after battle ends.`;
      return;
    }

    const damageDealt = rollDice(1, 8);
    bubblebeamUsesUsedThisBattle += 1;
    const remainingUses = 2 - bubblebeamUsesUsedThisBattle;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-water">Water</span> type move. You deal ${damageDealt} damage to target. ${remainingUses} use${remainingUses === 1 ? "" : "s"} remaining this battle.`;
    return;
  }

  if (moveName === "Psywave") {
    if (psywaveUsesUsedThisBattle >= 2) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 2 times this battle. It resets after battle ends.`;
      return;
    }

    const damageDealt = rollDice(1, 6);
    psywaveUsesUsedThisBattle += 1;
    const remainingUses = 2 - psywaveUsesUsedThisBattle;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-psychic">Psychic</span> type move. You deal ${damageDealt} damage to target. ${remainingUses} use${remainingUses === 1 ? "" : "s"} remaining this battle.`;
    return;
  }

  if (moveName === "Counter") {
    if (counterUsesUsedThisBattle >= 2) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 2 times this battle. It resets after battle ends.`;
      return;
    }

    counterUsesUsedThisBattle += 1;
    const remainingUses = 2 - counterUsesUsedThisBattle;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-fighting">Fighting</span> type move. User moves last in battle. If attacked with a Normal or Fighting type move this turn, you deal 2x damage back to the attacker. ${remainingUses} use${remainingUses === 1 ? "" : "s"} remaining this battle.`;
    return;
  }

  if (moveName === "Thunderbolt") {
    if (thunderboltUsesUsedThisBattle >= 1) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 1 time this battle. It resets after battle ends.`;
      return;
    }

    const damageDealt = rollDice(1, 10);
    thunderboltUsesUsedThisBattle += 1;
    const remainingUses = 1 - thunderboltUsesUsedThisBattle;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-electric">Electric</span> type move. You deal ${damageDealt} damage to target. ${remainingUses} use remaining this battle.`;
    return;
  }

  if (moveName === "Surf") {
    if (surfUsesUsedToday >= 1) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 1 time today. It resets after a rest.`;
      return;
    }

    const damageDealt = rollDice(1, 10);
    const transportHours = rollDice(1, 6);
    surfUsesUsedToday += 1;
    const remainingUses = 1 - surfUsesUsedToday;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-water">Water</span> type move. You deal ${damageDealt} blast damage. This move can also transport up to 6 Pokémon across a large body of water in ${transportHours} hour${transportHours === 1 ? "" : "s"}. ${remainingUses} use remaining today.`;
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
  selectedMainAbility = abilityScoreName;
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
// Resets all move counters that are limited to a certain number of uses per battle.
function resetBattleMoveUses() {
  bubbleUsesUsedThisBattle = 0;
  psywaveUsesUsedThisBattle = 0;
  counterUsesUsedThisBattle = 0;
  bubblebeamUsesUsedThisBattle = 0;
  thunderboltUsesUsedThisBattle = 0;
  karateChopUsesUsedThisBattle = 0;
  wrapUsesUsedThisBattle = 0;
  lickUsesUsedThisBattle = 0;
  leerUsesUsedThisBattle = 0;
  sandAttackUsesUsedThisBattle = 0;
}

// Resets all move counters limited per day (and also resets per-battle moves).
function resetDailyMoveUses() {
  cutUsesUsedToday = 0;
  surfUsesUsedToday = 0;
  tailWhipUsesUsedToday = 0;
  teleportUsesUsedToday = 0;
  confuseRayUsesUsedToday = 0;
  strengthUsesUsedToday = 0;
  resetBattleMoveUses();
}

// Starts a new battle: resets all per-battle move counters and updates the log.
function startBattle() {
  resetBattleMoveUses();
  savingThrowResultElement.innerHTML = "<strong>Battle started!</strong> Move uses per battle have been reset.";
}

// Ends the current battle: resets per-battle move counters and updates the log.
function endBattle() {
  resetBattleMoveUses();
  savingThrowResultElement.innerHTML = "<strong>Battle ended!</strong> Move uses per battle have been reset.";
}

// Rests the character: restores HP to maximum and resets all daily and battle move limits.
function rest() {
  resetDailyMoveUses();
  if (currentPokemonMaxHp !== null) {
    currentPokemonHp = currentPokemonMaxHp;
    startingHpElement.textContent = `${currentPokemonHp}/${currentPokemonMaxHp}`;
  }
  savingThrowResultElement.innerHTML = "<strong>Rested!</strong> Hit points and all expired move uses (daily & battle) have been reset.";
}

function createNewCharacter() {
  selectedMainAbility = null;
  resetDailyMoveUses();
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
if (startBattleBtn) {
  startBattleBtn.addEventListener("click", startBattle);
}
if (endBattleBtn) {
  endBattleBtn.addEventListener("click", endBattle);
}
if (restBtn) {
  restBtn.addEventListener("click", rest);
}
renderSaveSlots();

for (const [abilityScoreName, element] of Object.entries(abilityScoreElements)) {
  element.addEventListener("click", () => performSavingThrow(abilityScoreName));
}
