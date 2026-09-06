// Shared mutable game state touched by functions across multiple files
// (moves, battle controls, bench saves, character creation). Import the
// `state` object and mutate its properties directly, e.g. `state.currentPokemonHp = hp`.
export const state = {
  selectedMainAbility: null,
  currentAbilityScores: null,
  currentPokemonHp: null,
  currentPokemonMaxHp: null,
  consumedMoveNames: new Set(),

  // Usage counters for limited daily moves (reset after rest)
  cutUsesUsedToday: 0,
  surfUsesUsedToday: 0,
  tailWhipUsesUsedToday: 0,
  teleportUsesUsedToday: 0,
  confuseRayUsesUsedToday: 0,
  strengthUsesUsedToday: 0,

  // Usage counters for limited per-battle moves (reset when battle starts/ends or after rest)
  bubbleUsesUsedThisBattle: 0,
  psywaveUsesUsedThisBattle: 0,
  counterUsesUsedThisBattle: 0,
  bubblebeamUsesUsedThisBattle: 0,
  thunderboltUsesUsedThisBattle: 0,
  karateChopUsesUsedThisBattle: 0,
  wrapUsesUsedThisBattle: 0,
  lickUsesUsedThisBattle: 0,
  leerUsesUsedThisBattle: 0,
  sandAttackUsesUsedThisBattle: 0,
};
