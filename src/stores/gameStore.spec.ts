import { setActivePinia, createPinia } from "pinia";
import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "./gameStore";

describe("Game Store (Round Based)", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("initializes with default values", () => {
    const store = useGameStore();
    expect(store.score).toBe(0);
    expect(store.streak).toBe(0);
    expect(store.currentRound).toBe(1);
    expect(store.status).toBe("idle");
  });

  it("starts the game with a custom number of rounds", () => {
    const store = useGameStore();
    store.startGame(15);

    expect(store.status).toBe("playing");
    expect(store.maxRounds).toBe(15);
    expect(store.currentRound).toBe(1);
  });

  it("increments score and streak only while playing", () => {
    const store = useGameStore();

    store.incrementScore();
    // Should not score if idle
    expect(store.score).toBe(0);

    store.startGame(5);
    store.incrementScore();
    expect(store.score).toBe(1);
    expect(store.streak).toBe(1);
  });

  it("resets streak correctly", () => {
    const store = useGameStore();
    store.startGame(5);

    store.incrementScore();
    store.incrementScore();
    expect(store.streak).toBe(2);

    store.resetStreak();
    expect(store.streak).toBe(0);
    // Score should remain unchanged
    expect(store.score).toBe(2);
  });

  it("advances rounds and ends the game when max rounds are reached", () => {
    const store = useGameStore();
    // Create a 2-round game
    store.startGame(2);

    expect(store.currentRound).toBe(1);

    store.nextRound();
    expect(store.currentRound).toBe(2);
    expect(store.status).toBe("playing");

    // Should trigger game over
    store.nextRound();
    expect(store.currentRound).toBe(2);
    expect(store.status).toBe("game-over");
  });
});
