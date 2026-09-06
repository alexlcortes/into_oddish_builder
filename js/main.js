import { createCharacterBtn, startBattleBtn, endBattleBtn, restBtn, abilityScoreElements } from "./dom.js";
import { createNewCharacter, performSavingThrow } from "./characterCreation.js";
import { startBattle, endBattle, rest } from "./battle.js";
import { renderSaveSlots } from "./bench.js";

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
