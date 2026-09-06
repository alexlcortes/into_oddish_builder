import {
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
  saveSlotsList,
} from "./dom.js";
import { state } from "./state.js";
import { abilityScoreLabels, pokemonStartingData } from "./data.js";
import { getPokemon, getPokedollarBonus, slugifyPokemonName, getMoveTypeClass } from "./lookups.js";
import { useMove } from "./moves.js";
import { resetDailyMoveUses } from "./battle.js";
import { renderAbilityScores } from "./characterCreation.js";

const SAVE_KEY = "oddish-builder-saves";
const saveSlots = loadSaveSlots();

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
  if (!state.currentAbilityScores || !state.selectedMainAbility) {
    return null;
  }

  const selectedPokemon = pokemonNameElement.textContent || getPokemon(state.selectedMainAbility, state.currentAbilityScores[state.selectedMainAbility]);
  const startData = pokemonStartingData[selectedPokemon];
  const bonusMove = startData ? getPokedollarBonus(startData, Number(pokedollarsElement.textContent)) : null;

  return {
    pokemon: selectedPokemon,
    mainAbility: state.selectedMainAbility,
    abilityScores: {
      ...state.currentAbilityScores,
    },
    pokedollars: Number(pokedollarsElement.textContent) || 0,
    hp: {
      current: Number(state.currentPokemonHp) || 0,
      max: Number(state.currentPokemonMaxHp) || 0,
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

  state.currentAbilityScores = { ...slotData.abilityScores };
  state.selectedMainAbility = slotData.mainAbility || Object.keys(state.currentAbilityScores).sort((a, b) => state.currentAbilityScores[b] - state.currentAbilityScores[a])[0];

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

  state.currentPokemonHp = Number(slotData.hp.current) || 0;
  state.currentPokemonMaxHp = Number(slotData.hp.max) || state.currentPokemonHp;
  startingHpElement.textContent = `${state.currentPokemonHp}/${state.currentPokemonMaxHp}`;
  startingArmorElement.textContent = slotData.armor ?? 0;

  const startData = pokemonStartingData[slotData.pokemon];
  state.consumedMoveNames.clear();
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
  if (state.selectedMainAbility && abilityScoreElements[state.selectedMainAbility]) {
    abilityScoreElements[state.selectedMainAbility].classList.add("ability-score-highest");
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
  if (!state.currentAbilityScores || !state.selectedMainAbility) {
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

export function renderSaveSlots() {
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
