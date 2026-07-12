<script setup lang="ts">
import { ref, computed } from "vue";
import type { CountryData } from "../../types";
import countriesData from "../../data/countries.json";

const props = defineProps<{
  gameTitle: string;
  gameDescription: string;
  destinationRoute: string;
}>();

// 1. Dynamically extract unique continents from our dataset
const availableContinents = computed(() => {
  const continents = (countriesData as CountryData[])
    .map((c) => c.continent)
    .filter(Boolean) as string[];

  return [...new Set(continents)].sort();
});

// 2. Local Setup State
const selectedRounds = ref<number>(10);
const roundOptions = [5, 10, 20, 50];

// If empty, we assume "All Continents"
const selectedContinents = ref<string[]>([]);

// 3. Handlers
const toggleContinent = (continent: string) => {
  if (selectedContinents.value.includes(continent)) {
    selectedContinents.value = selectedContinents.value.filter(
      (c) => c !== continent,
    );
  } else {
    selectedContinents.value.push(continent);
  }
};

// 4. Generate the final URL with query parameters
const startUrl = computed(() => {
  const params = new URLSearchParams();
  params.set("rounds", selectedRounds.value.toString());

  if (selectedContinents.value.length > 0) {
    params.set("continents", selectedContinents.value.join(","));
  }

  return `${props.destinationRoute}?${params.toString()}`;
});
</script>

<template>
  <div
    class="mx-auto mt-12 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
  >
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-black text-slate-800">{{ props.gameTitle }}</h1>
      <p class="mt-2 text-slate-500">{{ props.gameDescription }}</p>
    </div>

    <div class="mb-8">
      <h2
        class="mb-4 text-sm font-bold tracking-widest text-slate-400 uppercase"
      >
        Numero di Round
      </h2>
      <div class="flex gap-3">
        <button
          v-for="option in roundOptions"
          :key="option"
          class="flex-1 rounded-xl border-2 py-3 font-bold transition-all duration-200"
          :class="
            selectedRounds === option
              ? 'border-(--brand-primary) bg-(--brand-primary)/10 text-(--brand-primary)'
              : 'border-slate-200 text-slate-500 hover:border-slate-300'
          "
          @click="selectedRounds = option"
        >
          {{ option }}
        </button>
      </div>
    </div>

    <div class="mb-10">
      <div class="mb-4 flex items-end justify-between">
        <h2 class="text-sm font-bold tracking-widest text-slate-400 uppercase">
          Continenti
        </h2>
        <span class="text-xs font-medium text-slate-400">
          {{
            selectedContinents.length === 0
              ? "Mondo Intero"
              : `${selectedContinents.length} Selezionati`
          }}
        </span>
      </div>

      <div class="flex flex-wrap gap-3">
        <button
          v-for="continent in availableContinents"
          :key="continent"
          class="rounded-lg border-2 px-4 py-2 font-medium transition-all duration-200"
          :class="
            selectedContinents.includes(continent)
              ? 'border-(--brand-purple) bg-(--brand-purple) text-white shadow-md'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          "
          @click="toggleContinent(continent)"
        >
          {{ continent }}
        </button>
      </div>
    </div>

    <a
      :href="startUrl"
      class="block w-full rounded-xl bg-(--brand-green) py-4 text-center text-xl font-black text-slate-900 shadow-md transition-colors hover:bg-green-400 active:scale-[0.98]"
    >
      Inizia Partita
    </a>
  </div>
</template>
