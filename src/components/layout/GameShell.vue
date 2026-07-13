<script setup lang="ts">
import GameHUD from "./GameHUD.vue";

const handleExit = () => {
  window.location.href = "/";
};
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-50">
    <GameHUD @exit="handleExit" />

    <main class="relative w-full flex-1">
      <slot />
    </main>
  </div>
</template>
