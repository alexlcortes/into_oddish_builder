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
