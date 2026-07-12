<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed } from "vue";
import Fuse from "fuse.js";

// 1. Generic Props so this can search ANY array of objects
const props = defineProps<{
  items: T[];
  // Field to search, e.g. ['name', 'capital']
  searchKeys: string[];
  // Which key to show in the dropdown, e.g. ['name', 'capital']
  displayKey: keyof T;
  placeholder?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "select", item: T): void;
}>();

// 2. State
const query = ref("");
const isOpen = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

// 3. Initialize Fuse.js Engine
const fuse = computed(() => {
  return new Fuse(props.items, {
    keys: props.searchKeys,
    threshold: 0.3,
    distance: 100,
  });
});

// 4. Reactive Search Results
const filteredResults = computed(() => {
  if (!query.value) {
    // Return first 5 items if the user clicked the box but hasn't typed
    return props.items.slice(0, 5);
  }
  // Search and extract the actual item from the Fuse result wrapper, limit to top 5
  return fuse.value
    .search(query.value)
    .map((result) => result.item)
    .slice(0, 5);
});

// 5. Handlers
const selectItem = (item: T) => {
  query.value = "";
  isOpen.value = false;
  inputRef.value?.blur();
  emit("select", item);
};

const handleBlur = () => {
  // Delay closing the dropdown slightly so the click event on the list item can register
  setTimeout(() => {
    isOpen.value = false;
  }, 150);
};
</script>

<template>
  <div class="relative mx-auto w-full max-w-md">
    <div class="relative">
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        :placeholder="props.placeholder || 'Search...'"
        :disabled="props.disabled"
        autocomplete="off"
        class="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 transition-all focus:border-(--brand-primary) focus:ring-4 focus:ring-(--brand-primary)/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        @focus="isOpen = true"
        @blur="handleBlur"
      />

      <svg
        class="absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>

    <div
      v-if="isOpen && filteredResults.length > 0"
      class="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
    >
      <ul class="max-h-60 overflow-y-auto overscroll-contain">
        <li
          v-for="(item, index) in filteredResults"
          :key="index"
          class="cursor-pointer border-b border-slate-100 px-4 py-3 transition-colors last:border-0 hover:bg-sky-50"
          @click="selectItem(item)"
        >
          <span class="font-medium text-slate-700">{{
            item[props.displayKey]
          }}</span>
        </li>
      </ul>
    </div>

    <div
      v-else-if="isOpen && query.length > 0"
      class="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white p-4 text-center text-slate-500 shadow-xl"
    >
      No matches found.
    </div>
  </div>
</template>
