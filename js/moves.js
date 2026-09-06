import { startingMovesList, savingThrowResultElement, startingHpElement } from "./dom.js";
import { state } from "./state.js";
import { isConsumableItem } from "./lookups.js";
import { rollDice, roll1d20 } from "./dice.js";

// Executes a Pokémon move or consumable item action. Handles target selection
// (Self/Other) for consumable items, enforces daily & battle usage limits,
// updates HP/status accordingly, and renders the result to the log.
export function useMove(moveName, targetChoice = null) {
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
    const healAmount = Math.min(damageDealt, state.currentPokemonMaxHp - state.currentPokemonHp);
    state.currentPokemonHp = Math.min(state.currentPokemonMaxHp, state.currentPokemonHp + healAmount);
    startingHpElement.textContent = `${state.currentPokemonHp}/${state.currentPokemonMaxHp}`;

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
    if (state.karateChopUsesUsedThisBattle >= 2) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 2 times this battle. It resets after battle ends.`;
      return;
    }

    const roll = rollDice(1, 6);
    const isCritical = roll >= 5;
    const damageDealt = isCritical ? roll + rollDice(1, 6) : roll;
    state.karateChopUsesUsedThisBattle += 1;
    const remainingUses = 2 - state.karateChopUsesUsedThisBattle;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-normal">Normal</span> type move. You deal ${damageDealt} damage to the target${isCritical ? " (critical hit!)" : ""}. ${remainingUses} use${remainingUses === 1 ? "" : "s"} remaining this battle.`;
    return;
  }

  if (moveName === "Tail Whip") {
    if (state.tailWhipUsesUsedToday >= 3) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 3 times today. It resets after a rest.`;
      return;
    }

    state.tailWhipUsesUsedToday += 1;
    const remainingUses = 3 - state.tailWhipUsesUsedToday;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-normal">Normal</span> type move. Target's Armor is reduced by 1 for the rest of the battle. ${remainingUses} use${remainingUses === 1 ? "" : "s"} remaining today.`;
    return;
  }

  if (moveName === "Wrap") {
    if (state.wrapUsesUsedThisBattle >= 2) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 2 times this battle. It resets after battle ends.`;
      return;
    }

    const turnsBound = rollDice(1, 4);
    const damageDealt = rollDice(1, 4);
    state.wrapUsesUsedThisBattle += 1;
    const remainingUses = 2 - state.wrapUsesUsedThisBattle;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-normal">Normal</span> type move. You must spend the next ${turnsBound} turn${turnsBound === 1 ? "" : "s"} attacking the same target, unless it faints. Target takes ${damageDealt} damage this turn and is immobilized. ${remainingUses} use${remainingUses === 1 ? "" : "s"} remaining this battle.`;
    return;
  }

  if (moveName === "Teleport") {
    if (state.teleportUsesUsedToday >= 2) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 2 times today. It resets after a rest.`;
      return;
    }

    state.teleportUsesUsedToday += 1;
    const remainingUses = 2 - state.teleportUsesUsedToday;
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
    if (state.lickUsesUsedThisBattle >= 3) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 3 times this battle. It resets after battle ends.`;
      return;
    }

    const roll = rollDice(1, 4);
    const isCritical = roll === 4;
    const damageDealt = isCritical ? roll + rollDice(1, 4) : roll;
    state.lickUsesUsedThisBattle += 1;
    const remainingUses = 3 - state.lickUsesUsedThisBattle;
    const criticalDetail = isCritical ? ` Critical hit! Target suffers the <strong>PARALYZE</strong> status.` : "";
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-ghost">Ghost</span> type move. You deal ${damageDealt} damage to the target.${criticalDetail} Psychic-type Pokémon are immune to this attack. ${remainingUses} use${remainingUses === 1 ? "" : "s"} remaining this battle.`;
    return;
  }

  if (moveName === "Leer") {
    if (state.leerUsesUsedThisBattle >= 3) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 3 times this battle. It resets after battle ends.`;
      return;
    }

    state.leerUsesUsedThisBattle += 1;
    const remainingUses = 3 - state.leerUsesUsedThisBattle;
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
    if (state.confuseRayUsesUsedToday >= 1) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 1 time today. It resets after a rest.`;
      return;
    }

    const confusionTurns = rollDice(1, 4);
    state.confuseRayUsesUsedToday += 1;
    const remainingUses = 1 - state.confuseRayUsesUsedToday;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-ghost">Ghost</span> type move. Target suffers the <strong>CONFUSION</strong> status for ${confusionTurns} turn${confusionTurns === 1 ? "" : "s"}. While confused, the target must make a Willpower save each turn or take 1d6 damage injuring themselves. ${remainingUses} use remaining today.`;
    return;
  }

  if (moveName === "Sand-Attack") {
    if (state.sandAttackUsesUsedThisBattle >= 1) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 1 time this battle. It resets after battle ends.`;
      return;
    }

    state.sandAttackUsesUsedThisBattle += 1;
    const remainingUses = 1 - state.sandAttackUsesUsedThisBattle;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-ground">Ground</span> type move. Target's Accuracy is lowered by 1 stage for the remainder of the battle, dropping their damage die down one size (e.g. 1d6 becomes 1d4). ${remainingUses} use remaining this battle.`;
    return;
  }

  if (moveName === "Potion") {
    state.consumedMoveNames.add(moveName);
    if (matchingButton) {
      matchingButton.disabled = true;
      matchingButton.classList.add("starting-move-button-used");
    }

    const rawHeal = rollDice(2, 4);
    const targetLabel = targetChoice === "other" ? "another Pokémon" : "yourself";
    if (targetChoice === "other") {
      savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong> on <strong>${targetLabel}</strong>. It heals ${rawHeal} HP.`;
    } else {
      const healAmount = Math.min(rawHeal, state.currentPokemonMaxHp - state.currentPokemonHp);
      state.currentPokemonHp = Math.min(state.currentPokemonMaxHp, state.currentPokemonHp + healAmount);
      startingHpElement.textContent = `${state.currentPokemonHp}/${state.currentPokemonMaxHp}`;
      savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong> on <strong>${targetLabel}</strong>. It heals ${healAmount} HP.`;
    }
    return;
  }

  if (moveName === "Super Potion") {
    state.consumedMoveNames.add(moveName);
    if (matchingButton) {
      matchingButton.disabled = true;
      matchingButton.classList.add("starting-move-button-used");
    }

    const rawHeal = rollDice(2, 8);
    const targetLabel = targetChoice === "other" ? "another Pokémon" : "yourself";
    if (targetChoice === "other") {
      savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong> on <strong>${targetLabel}</strong>. It heals ${rawHeal} HP.`;
    } else {
      const healAmount = Math.min(rawHeal, state.currentPokemonMaxHp - state.currentPokemonHp);
      state.currentPokemonHp = Math.min(state.currentPokemonMaxHp, state.currentPokemonHp + healAmount);
      startingHpElement.textContent = `${state.currentPokemonHp}/${state.currentPokemonMaxHp}`;
      savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong> on <strong>${targetLabel}</strong>. It heals ${healAmount} HP.`;
    }
    return;
  }

  if (moveName === "Antidote") {
    state.consumedMoveNames.add(moveName);
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
    state.consumedMoveNames.add(moveName);
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
    state.consumedMoveNames.add(moveName);
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
    state.consumedMoveNames.add(moveName);
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
    state.consumedMoveNames.add(moveName);
    if (matchingButton) {
      matchingButton.disabled = true;
      matchingButton.classList.add("starting-move-button-used");
    }

    const targetLabel = targetChoice === "other" ? "another Pokémon" : "yourself";
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong> on <strong>${targetLabel}</strong>. Enemy Pokémon have disadvantage on morale saves for one day.`;
    return;
  }

  if (moveName === "Strength") {
    if (state.strengthUsesUsedToday >= 1) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 1 time today. It resets after a rest.`;
      return;
    }

    const damageDealt = rollDice(1, 8);
    state.strengthUsesUsedToday += 1;
    const remainingUses = 1 - state.strengthUsesUsedToday;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-normal">Normal</span> type move. You deal ${damageDealt} HP to the target. It can also move travel-blocking boulders. ${remainingUses} use remaining today.`;
    return;
  }

  if (moveName === "Dig") {
    const damageDealt = rollDice(1, 10);
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-ground">Ground</span> type move. You dig underground, evading the next attack. On your next turn, you emerge and deal ${damageDealt} HP damage to the target. Can also dig a path to a lower level of the dungeon.`;
    return;
  }

  if (moveName === "Cut") {
    if (state.cutUsesUsedToday >= 3) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 3 times today. It resets after a rest.`;
      return;
    }

    const damageDealt = rollDice(1, 6);
    state.cutUsesUsedToday += 1;
    const remainingUses = 3 - state.cutUsesUsedToday;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-normal">Normal</span> type move. You deal ${damageDealt} damage to the target. Can also cut a path in the forest by clearing foliage. ${remainingUses} use${remainingUses === 1 ? "" : "s"} remaining today.`;
    return;
  }

  if (moveName === "Bubble") {
    if (state.bubbleUsesUsedThisBattle >= 3) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 3 times this battle. It resets after battle ends.`;
      return;
    }

    const damageDealt = rollDice(1, 4);
    state.bubbleUsesUsedThisBattle += 1;
    const remainingUses = 3 - state.bubbleUsesUsedThisBattle;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-water">Water</span> type move. You deal ${damageDealt} blast damage. Target has disadvantage on Dexterity saves until they pass a Dexterity save. ${remainingUses} use${remainingUses === 1 ? "" : "s"} remaining this battle.`;
    return;
  }

  if (moveName === "Bubblebeam") {
    if (state.bubblebeamUsesUsedThisBattle >= 2) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 2 times this battle. It resets after battle ends.`;
      return;
    }

    const damageDealt = rollDice(1, 8);
    state.bubblebeamUsesUsedThisBattle += 1;
    const remainingUses = 2 - state.bubblebeamUsesUsedThisBattle;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-water">Water</span> type move. You deal ${damageDealt} damage to target. ${remainingUses} use${remainingUses === 1 ? "" : "s"} remaining this battle.`;
    return;
  }

  if (moveName === "Psywave") {
    if (state.psywaveUsesUsedThisBattle >= 2) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 2 times this battle. It resets after battle ends.`;
      return;
    }

    const damageDealt = rollDice(1, 6);
    state.psywaveUsesUsedThisBattle += 1;
    const remainingUses = 2 - state.psywaveUsesUsedThisBattle;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-psychic">Psychic</span> type move. You deal ${damageDealt} damage to target. ${remainingUses} use${remainingUses === 1 ? "" : "s"} remaining this battle.`;
    return;
  }

  if (moveName === "Counter") {
    if (state.counterUsesUsedThisBattle >= 2) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 2 times this battle. It resets after battle ends.`;
      return;
    }

    state.counterUsesUsedThisBattle += 1;
    const remainingUses = 2 - state.counterUsesUsedThisBattle;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-fighting">Fighting</span> type move. User moves last in battle. If attacked with a Normal or Fighting type move this turn, you deal 2x damage back to the attacker. ${remainingUses} use${remainingUses === 1 ? "" : "s"} remaining this battle.`;
    return;
  }

  if (moveName === "Thunderbolt") {
    if (state.thunderboltUsesUsedThisBattle >= 1) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 1 time this battle. It resets after battle ends.`;
      return;
    }

    const damageDealt = rollDice(1, 10);
    state.thunderboltUsesUsedThisBattle += 1;
    const remainingUses = 1 - state.thunderboltUsesUsedThisBattle;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-electric">Electric</span> type move. You deal ${damageDealt} damage to target. ${remainingUses} use remaining this battle.`;
    return;
  }

  if (moveName === "Surf") {
    if (state.surfUsesUsedToday >= 1) {
      savingThrowResultElement.innerHTML = `You have already used <strong>${moveName.toUpperCase()}</strong> 1 time today. It resets after a rest.`;
      return;
    }

    const damageDealt = rollDice(1, 10);
    const transportHours = rollDice(1, 6);
    state.surfUsesUsedToday += 1;
    const remainingUses = 1 - state.surfUsesUsedToday;
    savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>. <span class="type-tag pokemon-type-water">Water</span> type move. You deal ${damageDealt} blast damage. This move can also transport up to 6 Pokémon across a large body of water in ${transportHours} hour${transportHours === 1 ? "" : "s"}. ${remainingUses} use remaining today.`;
    return;
  }

  savingThrowResultElement.innerHTML = `You use <strong>${moveName.toUpperCase()}</strong>.`;
}
