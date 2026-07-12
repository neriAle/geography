<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useGameStore } from "../../stores/gameStore";
import FuzzyComboBox from "../ui/FuzzyComboBox.vue";
import type { CountryData } from "../../types";
import countriesData from "../../data/countries.json";

const store = useGameStore();

// --- Game State ---
const gameSequence = ref<CountryData[]>([]);
const feedback = ref<"correct" | "incorrect" | null>(null);
const userGuess = ref<CountryData | null>(null);

// --- Initialization ---
onMounted(() => {
  // 1. Extract URL Parameters
  const params = new URLSearchParams(window.location.search);
  const roundsParam = parseInt(params.get("rounds") || "10", 10);
  const continentsParam = params.get("continents");
  const allowedContinents = continentsParam ? continentsParam.split(",") : [];

  // 2. Filter valid countries (Must have ISO and a Capital)
  let validCountries = (countriesData as CountryData[]).filter(
    (c) => c.iso && c.capital,
  );

  if (allowedContinents.length > 0) {
    validCountries = validCountries.filter((c) =>
      allowedContinents.includes(c.continent || ""),
    );
  }

  // 3. Shuffle and pick target countries
  gameSequence.value = [...validCountries]
    .sort(() => Math.random() - 0.5)
    .slice(0, roundsParam);

  // 4. Start the Pinia Engine
  // Fallback to actual length if they selected 50 rounds but only 40 countries exist in the filtered list
  store.startGame(Math.min(roundsParam, gameSequence.value.length));
});

// --- Computed Values ---
const currentTarget = computed(() => {
  if (gameSequence.value.length === 0) return null;
  return gameSequence.value[store.currentRound - 1];
});

// We pass this to the ComboBox so users can only search valid answers
const allValidAnswers = computed(() => {
  return (countriesData as CountryData[]).filter((c) => c.iso && c.capital);
});

// --- Handlers ---
const handleGuess = (selectedCountry: CountryData) => {
  if (feedback.value || !currentTarget.value) return;

  userGuess.value = selectedCountry;

  if (selectedCountry.code === currentTarget.value.code) {
    feedback.value = "correct";
    store.incrementScore(100);
  } else {
    feedback.value = "incorrect";
    store.resetStreak();
  }

  // Wait 2.5 seconds to read the feedback, then move on
  setTimeout(() => {
    feedback.value = null;
    userGuess.value = null;

    if (store.currentRound < store.maxRounds) {
      store.nextRound();
    } else {
      store.endGame();
    }
  }, 2500);
};
</script>

<template>
  <div class="mx-auto mt-8 flex w-full max-w-2xl flex-col items-center p-4">
    <div
      v-if="!currentTarget && store.status === 'playing'"
      class="animate-pulse text-slate-500"
    >
      Loading game...
    </div>

    <div
      v-else-if="store.status === 'playing' && currentTarget"
      class="flex w-full flex-col items-center"
    >
      <div
        class="mb-8 flex w-full flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
      >
        <h2
          class="mb-4 text-sm font-bold tracking-widest text-slate-400 uppercase"
        >
          What is the capital of:
        </h2>
        <img
          :src="`/${currentTarget.flag}`"
          :alt="`Flag: ${currentTarget.name}`"
          class="mb-6 h-auto w-48 rounded border border-slate-100 object-cover shadow-sm"
        />
        <h1 class="text-3xl font-black text-slate-800">
          {{ currentTarget.name }}
        </h1>
      </div>

      <div class="relative h-32 w-full">
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div v-if="!feedback" class="absolute z-10 w-full">
            <FuzzyComboBox
              :items="allValidAnswers"
              :search-keys="['capital']"
              display-key="capital"
              placeholder="Search for a capital..."
              :autofocus="true"
              @select="handleGuess"
            />
          </div>
        </Transition>

        <Transition
          enter-active-class="transition duration-300 ease-out delay-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
        >
          <div
            v-if="feedback"
            class="absolute w-full rounded-xl border-2 p-6 text-center shadow-md"
            :class="
              feedback === 'correct'
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            "
          >
            <h2
              class="mb-1 text-2xl font-black"
              :class="
                feedback === 'correct' ? 'text-green-600' : 'text-red-600'
              "
            >
              {{ feedback === "correct" ? "Correct! 🎉" : "Incorrect! ❌" }}
            </h2>

            <p
              v-if="feedback === 'incorrect'"
              class="font-medium text-slate-600"
            >
              You chose
              <span class="font-bold text-slate-800">{{
                userGuess?.capital
              }}</span
              >.
            </p>
            <p class="mt-1 font-medium text-slate-600">
              The capital is
              <span class="font-bold text-slate-800">{{
                currentTarget.capital
              }}</span
              >.
            </p>
          </div>
        </Transition>
      </div>
    </div>

    <div
      v-else-if="store.status === 'game-over'"
      class="mt-10 w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
    >
      <h1 class="mb-2 text-4xl font-black text-slate-800">Game Over!</h1>
      <p class="mb-8 text-slate-500">
        You completed {{ store.maxRounds }} rounds.
      </p>

      <div class="mb-10 flex justify-center gap-12">
        <div class="flex flex-col items-center">
          <span
            class="text-xs font-bold tracking-widest text-slate-400 uppercase"
            >Score</span
          >
          <span class="text-5xl font-black text-(--brand-primary)">{{
            store.score
          }}</span>
        </div>
        <div class="flex flex-col items-center">
          <span
            class="text-xs font-bold tracking-widest text-slate-400 uppercase"
            >Best Streak</span
          >
          <span class="text-5xl font-black text-(--brand-orange)">{{
            store.bestStreak
          }}</span>
        </div>
      </div>

      <div class="flex justify-center gap-4">
        <a
          href=""
          class="rounded-xl bg-(--brand-primary) px-6 py-3 font-bold text-white shadow-md transition-colors hover:bg-sky-500"
        >
          Play Again
        </a>
        <a
          href="/setup/capitals"
          class="rounded-xl bg-slate-200 px-6 py-3 font-bold text-slate-700 transition-colors hover:bg-slate-300"
        >
          Change Settings
        </a>
      </div>
    </div>
  </div>
</template>
