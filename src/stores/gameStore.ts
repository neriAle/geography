import { defineStore } from "pinia";
import { ref } from "vue";
import type { GameStatus } from "../types";

export const useGameStore = defineStore("game", () => {
  // State
  const score = ref<number>(0);
  const streak = ref<number>(0);
  const currentRound = ref<number>(1);
  const maxRounds = ref<number>(10);
  const status = ref<GameStatus>("idle");

  // Actions
  const startGame = (rounds: number = 10) => {
    score.value = 0;
    streak.value = 0;
    currentRound.value = 1;
    maxRounds.value = rounds;
    status.value = "playing";
  };

  const endGame = () => {
    status.value = "game-over";
  };

  const nextRound = () => {
    if (status.value !== "playing") return;

    if (currentRound.value < maxRounds.value) {
      currentRound.value++;
    } else {
      endGame();
    }
  };

  const incrementScore = (points: number = 1) => {
    if (status.value !== "playing") return;
    score.value += points;
    streak.value++;
  };

  const resetStreak = () => {
    streak.value = 0;
  };

  return {
    score,
    streak,
    currentRound,
    maxRounds,
    status,
    startGame,
    endGame,
    nextRound,
    incrementScore,
    resetStreak,
  };
});
