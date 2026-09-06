import { savingThrowResultElement, startingHpElement } from "./dom.js";
import { state } from "./state.js";

// Resets all move counters that are limited to a certain number of uses per battle.
export function resetBattleMoveUses() {
  state.bubbleUsesUsedThisBattle = 0;
  state.psywaveUsesUsedThisBattle = 0;
  state.counterUsesUsedThisBattle = 0;
  state.bubblebeamUsesUsedThisBattle = 0;
  state.thunderboltUsesUsedThisBattle = 0;
  state.karateChopUsesUsedThisBattle = 0;
  state.wrapUsesUsedThisBattle = 0;
  state.lickUsesUsedThisBattle = 0;
  state.leerUsesUsedThisBattle = 0;
  state.sandAttackUsesUsedThisBattle = 0;
}

// Resets all move counters limited per day (and also resets per-battle moves).
export function resetDailyMoveUses() {
  state.cutUsesUsedToday = 0;
  state.surfUsesUsedToday = 0;
  state.tailWhipUsesUsedToday = 0;
  state.teleportUsesUsedToday = 0;
  state.confuseRayUsesUsedToday = 0;
  state.strengthUsesUsedToday = 0;
  resetBattleMoveUses();
}

// Starts a new battle: resets all per-battle move counters and updates the log.
export function startBattle() {
  resetBattleMoveUses();
  savingThrowResultElement.innerHTML = "<strong>Battle started!</strong> Move uses per battle have been reset.";
}

// Ends the current battle: resets per-battle move counters and updates the log.
export function endBattle() {
  resetBattleMoveUses();
  savingThrowResultElement.innerHTML = "<strong>Battle ended!</strong> Move uses per battle have been reset.";
}

// Rests the character: restores HP to maximum and resets all daily and battle move limits.
export function rest() {
  resetDailyMoveUses();
  if (state.currentPokemonMaxHp !== null) {
    state.currentPokemonHp = state.currentPokemonMaxHp;
    startingHpElement.textContent = `${state.currentPokemonHp}/${state.currentPokemonMaxHp}`;
  }
  savingThrowResultElement.innerHTML = "<strong>Rested!</strong> Hit points and all expired move uses (daily & battle) have been reset.";
}
