<script setup lang="ts">
defineProps<{
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
}>();
</script>

<template>
  <button
    :disabled="disabled"
    class="flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
    :class="{
      'bg-(--brand-primary) text-white shadow-md hover:bg-sky-500':
        variant === 'primary' || !variant,
      'bg-slate-200 text-slate-700 hover:bg-slate-300': variant === 'secondary',
      'bg-(--brand-orange) text-white shadow-md hover:bg-orange-500':
        variant === 'danger',
      'bg-transparent text-slate-500 hover:bg-slate-100': variant === 'ghost',
    }"
  >
    <slot />
  </button>
</template>
