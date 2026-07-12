<script setup lang="ts">
import { useGameStore } from "../../stores/gameStore.js";
import Button from "../ui/Button.vue";

const store = useGameStore();

const emit = defineEmits<{
  (e: "exit"): void;
}>();

const handleExit = () => {
  store.endGame();
  emit("exit");
};
</script>

<template>
  <header
    class="z-50 w-full border-b border-slate-200 bg-white pt-[env(safe-area-inset-top)] shadow-sm"
  >
    <div class="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
      <div class="flex flex-1 justify-start">
        <Button variant="ghost" class="px-2! py-2!" @click="handleExit">
          <svg
            class="mr-1 h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Esci
        </Button>
      </div>

      <div class="flex flex-1 flex-col items-center">
        <span
          class="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase"
          >Round</span
        >
        <div class="text-xl leading-tight font-black text-slate-800">
          {{ store.currentRound }}
          <span class="text-base font-bold text-slate-400"
            >/ {{ store.maxRounds }}</span
          >
        </div>
      </div>

      <div class="flex flex-1 items-center justify-end gap-4">
        <div
          v-if="store.streak >= 3"
          class="flex animate-pulse flex-col items-end"
        >
          <span
            class="text-[10px] font-extrabold tracking-widest text-(--brand-orange) uppercase"
            >Serie</span
          >
          <span class="text-lg leading-tight font-black text-(--brand-orange)"
            >🔥 {{ store.streak }}</span
          >
        </div>

        <div class="flex flex-col items-end">
          <span
            class="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase"
            >Score</span
          >
          <span
            class="text-xl leading-tight font-black text-(--brand-primary)"
            >{{ store.score }}</span
          >
        </div>
      </div>
    </div>

    <div class="h-1 w-full bg-slate-100">
      <div
        class="h-full bg-(--brand-green) transition-all duration-300 ease-out"
        :style="{ width: `${(store.currentRound / store.maxRounds) * 100}%` }"
      ></div>
    </div>
  </header>
</template>
