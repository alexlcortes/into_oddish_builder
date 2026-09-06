import {
  abilityScoresPanel,
  mainAttributePrompt,
  mainAttributeChoices,
  rerollPrompt,
  rerollPromptText,
  rerollChoices,
  abilityScoreElements,
  pokedollarsElement,
  pokemonResultDiv,
  pokemonNameElement,
  pokemonTypesElement,
  startingStatsDiv,
  startingHpElement,
  startingArmorElement,
  startingMovesList,
  startingStatsMissingElement,
  pokemonArtElement,
  savingThrowResultElement,
} from "./dom.js";
import { state } from "./state.js";
import { abilityScoreLabels, pokemonStartingData } from "./data.js";
import { getPokemon, getPokedollarBonus, slugifyPokemonName, getMoveTypeClass } from "./lookups.js";
import { roll2d6, roll1d6, roll1d20, rollFromDiceNotation } from "./dice.js";
import { useMove } from "./moves.js";
import { resetDailyMoveUses } from "./battle.js";

// Resolves and renders the Pokemon for the chosen main ability, then shows
// its starting stats.
export function displayPokemon(mainAbility) {
  state.selectedMainAbility = mainAbility;
  const score = state.currentAbilityScores[mainAbility];
  const pokemon = getPokemon(mainAbility, score);
  pokemonNameElement.textContent = pokemon;
  pokemonResultDiv.hidden = false;
  displayStartingStats(pokemon);
}

// Rolls HP and renders a Pokemon's starting HP, armor, base moves, and
// Pokedollar-tier bonus move/item. Falls back to a "missing data" notice
// for any Pokemon not yet filled in in pokemonStartingData.
export function displayStartingStats(pokemon) {
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

  state.currentPokemonHp = hp;
  state.currentPokemonMaxHp = hp;
  startingHpElement.textContent = `${hp}/${hp}`;
  startingArmorElement.textContent = startData.armor ?? 0;

  state.consumedMoveNames.clear();
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
    if (bonus.consumable && state.consumedMoveNames.has(bonus.name)) {
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

// Rolls a 1d20 saving throw against an ability score. Success is rolling
// at or under the score, matching the tabletop convention this builder
// follows for ability checks.
export function performSavingThrow(abilityScoreName) {
  const score = state.currentAbilityScores[abilityScoreName];
  const roll = roll1d20();
  const success = roll <= score;
  const label = abilityScoreLabels[abilityScoreName];
  savingThrowResultElement.textContent = `You scored a (${roll}) on your ${label} save.  You ${success ? "succeeded!!!" : "failed..."}`;
}

// Writes the current ability score values into their DOM elements.
export function renderAbilityScores() {
  for (const [abilityScoreName, value] of Object.entries(state.currentAbilityScores)) {
    abilityScoreElements[abilityScoreName].textContent = value;
  }
}

// Handles the user's manual pick when multiple ability scores were tied for
// highest: marks it highlighted, hides the tie-breaker prompt, and reveals
// the resulting Pokemon.
export function highlightMainAttribute(abilityScoreName) {
  state.selectedMainAbility = abilityScoreName;
  for (const element of Object.values(abilityScoreElements)) {
    element.classList.remove("ability-score-highest");
  }
  abilityScoreElements[abilityScoreName].classList.add("ability-score-highest");
  mainAttributePrompt.hidden = true;
  displayPokemon(abilityScoreName);
}

// Renders one choice button per tied ability score so the user can break
// the tie for main attribute.
export function promptForMainAttribute(tiedAbilityScoreNames) {
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
export function chooseMainAttribute() {
  const highestScore = Math.max(...Object.values(state.currentAbilityScores));
  const tiedAbilityScoreNames = Object.entries(state.currentAbilityScores)
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
export function rerollAbilityScore(abilityScoreName) {
  state.currentAbilityScores[abilityScoreName] = roll2d6();
  renderAbilityScores();
  rerollPrompt.hidden = true;
  chooseMainAttribute();
}

// User declined to reroll: proceed straight to choosing the main attribute.
export function keepAllAbilityScores() {
  rerollPrompt.hidden = true;
  chooseMainAttribute();
}

// Offers a reroll for each ability score tied for lowest, plus a "keep all"
// option, before the main attribute is chosen.
export function promptForReroll() {
  const lowestScore = Math.min(...Object.values(state.currentAbilityScores));
  const tiedLowestAbilityScoreNames = Object.entries(state.currentAbilityScores)
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
export function createNewCharacter() {
  state.selectedMainAbility = null;
  resetDailyMoveUses();
  state.currentAbilityScores = {
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
  state.consumedMoveNames.clear();
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
