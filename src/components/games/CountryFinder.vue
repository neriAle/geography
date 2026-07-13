<script setup lang="ts">
import { ref, computed } from "vue";
import { useGameStore } from "../../stores/gameStore";
import InteractiveMap from "../ui/InteractiveMap.vue";
import type { CountryData } from "../../types";
import countriesData from "../../data/countries.json";

const store = useGameStore();

// --- Game State ---
const gameSequence = ref<CountryData[]>([]);
const feedback = ref<"correct" | "incorrect" | null>(null);
const userGuessIso = ref<string | null>(null);

// Wait for Map Ready before starting
const handleMapReady = (playableMapIsos: string[]) => {
  const params = new URLSearchParams(window.location.search);
  const roundsParam = parseInt(params.get("rounds") || "10", 10);
  const continentsParam = params.get("continents");
  const allowedContinents = continentsParam ? continentsParam.split(",") : [];

  // Strict Filter: Must have ISO, must be in allowed continents, and MUST exist on the map
  let validCountries = (countriesData as CountryData[]).filter(
    (c) => c.iso && playableMapIsos.includes(c.code),
  );

  if (allowedContinents.length > 0) {
    validCountries = validCountries.filter((c) =>
      allowedContinents.includes(c.continent || ""),
    );
  }

  gameSequence.value = [...validCountries]
    .sort(() => Math.random() - 0.5)
    .slice(0, roundsParam);

  store.startGame(Math.min(roundsParam, gameSequence.value.length));
};

// --- Computed Values ---
const currentTarget = computed(() => {
  if (gameSequence.value.length === 0) return null;
  return gameSequence.value[store.currentRound - 1];
});

const getCountryName = (isoCode: string | null) => {
  if (!isoCode) return "";
  const match = (countriesData as CountryData[]).find(
    (c) => c.code === isoCode,
  );
  return match ? match.name : "Unknown Territory";
};

// --- Handlers ---
const handleMapClick = (clickedIso: string) => {
  if (feedback.value || !currentTarget.value) return;

  userGuessIso.value = clickedIso;

  if (clickedIso === currentTarget.value.code) {
    feedback.value = "correct";
    store.incrementScore(100);
  } else {
    feedback.value = "incorrect";
    store.resetStreak();
  }

  // Wait 2.5s for the user to read the feedback and see the map highlight
  setTimeout(() => {
    feedback.value = null;
    userGuessIso.value = null;

    if (store.currentRound < store.maxRounds) {
      store.nextRound();
    } else {
      store.endGame();
    }
  }, 2500);
};
</script>

<template>
  <div class="mx-auto mt-8 flex w-full max-w-4xl flex-col items-center p-4">
    <div
      v-if="!currentTarget && store.status === 'playing'"
      class="mb-4 animate-pulse text-slate-500"
    >
      Building Map Data...
    </div>

    <div
      class="flex w-full flex-col items-center"
      :class="{
        'h-0 overflow-hidden opacity-0':
          !currentTarget && store.status !== 'game-over',
      }"
    >
      <!-- Prompt Header -->
      <div
        v-if="currentTarget && store.status === 'playing'"
        class="relative mb-6 flex w-full flex-col items-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
      >
        <h2
          class="mb-2 text-sm font-bold tracking-widest text-slate-400 uppercase"
        >
          Find this country on the map:
        </h2>
        <h1 class="text-3xl font-black text-slate-800">
          {{ currentTarget.name }}
        </h1>

        <!-- Feedback Overlay -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="feedback"
            class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
            :class="feedback === 'correct' ? 'bg-green-50' : 'bg-red-50'"
          >
            <h2
              class="text-2xl font-black"
              :class="
                feedback === 'correct' ? 'text-green-600' : 'text-red-600'
              "
            >
              {{ feedback === "correct" ? "Correct! 🎉" : "Incorrect! ❌" }}
            </h2>
            <p
              v-if="feedback === 'incorrect'"
              class="mt-1 font-medium text-slate-600"
            >
              You clicked on
              <span class="font-bold text-slate-800">{{
                getCountryName(userGuessIso)
              }}</span
              >.
            </p>
          </div>
        </Transition>
      </div>

      <!-- The Interactive Map Wrapper -->
      <div
        v-show="store.status !== 'game-over'"
        class="h-125 w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm md:h-150"
      >
        <InteractiveMap
          :target-id="currentTarget?.code"
          :guessed-id="userGuessIso"
          :interactive="!feedback"
          @country-clicked="handleMapClick"
          @map-ready="handleMapReady"
        />
      </div>
    </div>

    <!-- Game Over State -->
    <div
      v-if="store.status === 'game-over'"
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
            store.streak
          }}</span>
        </div>
      </div>

      <div class="flex flex-wrap justify-center gap-3">
        <a
          href=""
          class="rounded-xl bg-(--brand-primary) px-6 py-3 font-bold text-white shadow-md transition-colors hover:bg-sky-500"
        >
          Play Again
        </a>
        <a
          href="/setup/countries"
          class="rounded-xl bg-slate-200 px-6 py-3 font-bold text-slate-700 transition-colors hover:bg-slate-300"
        >
          Change Settings
        </a>
        <a
          href="/"
          class="rounded-xl bg-slate-100 px-6 py-3 font-bold text-slate-500 transition-colors hover:bg-slate-200"
        >
          Home
        </a>
      </div>
    </div>
  </div>
</template>
