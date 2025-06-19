<template>
  <div class="space-y-2">
    <div class="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border rounded-md bg-background">
      <!-- Existing Tags -->
      <div
        v-for="(tag, index) in modelValue"
        :key="index"
        class="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground text-sm rounded-md"
      >
        <span>{{ tag }}</span>
        <button
          type="button"
          @click="removeTag(index)"
          class="ml-1 hover:bg-primary/80 rounded-sm p-0.5"
          :disabled="disabled || false"
        >
          <XIcon class="h-3 w-3" />
        </button>
      </div>

      <!-- Input for new tags -->
      <input
        v-if="!disabled"
        ref="tagInput"
        v-model="currentTag"
        :placeholder="modelValue.length === 0 ? (placeholder || '') : ''"
        @keydown="handleKeyDown"
        @blur="addCurrentTag"
        class="flex-1 min-w-[100px] outline-none bg-transparent text-sm placeholder:text-muted-foreground"
        autocomplete="off"
      />

      <!-- Disabled state placeholder -->
      <span
        v-if="disabled && modelValue.length === 0"
        class="text-sm text-muted-foreground"
      >
        {{ placeholder }}
      </span>
    </div>

    <!-- Tag suggestions -->
    <div
      v-if="showSuggestions && filteredSuggestions.length > 0"
      class="border rounded-md bg-popover p-1 shadow-lg max-h-32 overflow-y-auto"
    >
      <div
        v-for="(suggestion, index) in filteredSuggestions"
        :key="suggestion"
        @click="addTag(suggestion)"
        :class="[
          'px-2 py-1 text-sm cursor-pointer rounded-sm',
          index === selectedSuggestionIndex
            ? 'bg-accent text-accent-foreground'
            : 'hover:bg-accent/50'
        ]"
      >
        {{ suggestion }}
      </div>
    </div>

    <!-- Help text -->
    <p v-if="helpText" class="text-xs text-muted-foreground">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue";
import { XIcon } from "lucide-vue-next";

interface Props {
  modelValue: string[];
  placeholder?: string;
  suggestions?: string[];
  maxTags?: number;
  disabled?: boolean;
  helpText?: string;
  allowDuplicates?: boolean;
}

interface Emits {
  (e: "update:modelValue", value: string[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Add tags...",
  suggestions: () => [],
  maxTags: 10,
  disabled: false,
  helpText: "Press Enter or comma to add tags",
  allowDuplicates: false,
});

const emit = defineEmits<Emits>();

const currentTag = ref("");
const tagInput = ref<HTMLInputElement>();
const showSuggestions = ref(false);
const selectedSuggestionIndex = ref(-1);

// Computed
const filteredSuggestions = computed(() => {
  if (!currentTag.value.trim() || props.suggestions.length === 0) {
    return [];
  }

  const query = currentTag.value.toLowerCase();
  return props.suggestions
    .filter(
      (suggestion) =>
        suggestion.toLowerCase().includes(query) &&
        (props.allowDuplicates || !props.modelValue.includes(suggestion))
    )
    .slice(0, 5);
});

// Watch current tag input
watch(currentTag, (newValue) => {
  showSuggestions.value = !!newValue.trim() && filteredSuggestions.value.length > 0;
  selectedSuggestionIndex.value = -1;
});

// Methods
const addTag = (tag: string) => {
  const cleanTag = tag.trim();
  if (!cleanTag) return;

  if (props.modelValue.length >= props.maxTags) {
    return;
  }

  if (!props.allowDuplicates && props.modelValue.includes(cleanTag)) {
    return;
  }

  const newTags = [...props.modelValue, cleanTag];
  emit("update:modelValue", newTags);
  currentTag.value = "";
  showSuggestions.value = false;
  
  nextTick(() => {
    tagInput.value?.focus();
  });
};

const addCurrentTag = () => {
  if (currentTag.value.trim()) {
    addTag(currentTag.value);
  }
};

const removeTag = (index: number) => {
  const newTags = props.modelValue.filter((_, i) => i !== index);
  emit("update:modelValue", newTags);
};

const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case "Enter":
      event.preventDefault();
      if (selectedSuggestionIndex.value >= 0) {
        addTag(filteredSuggestions.value[selectedSuggestionIndex.value]);
      } else {
        addCurrentTag();
      }
      break;

    case ",":
      event.preventDefault();
      addCurrentTag();
      break;

    case "Backspace":
      if (!currentTag.value && props.modelValue.length > 0) {
        removeTag(props.modelValue.length - 1);
      }
      break;

    case "ArrowDown":
      event.preventDefault();
      if (filteredSuggestions.value.length > 0) {
        selectedSuggestionIndex.value = Math.min(
          selectedSuggestionIndex.value + 1,
          filteredSuggestions.value.length - 1
        );
      }
      break;

    case "ArrowUp":
      event.preventDefault();
      if (filteredSuggestions.value.length > 0) {
        selectedSuggestionIndex.value = Math.max(selectedSuggestionIndex.value - 1, 0);
      }
      break;

    case "Escape":
      showSuggestions.value = false;
      selectedSuggestionIndex.value = -1;
      break;
  }
};

// Focus method for external use
const focus = () => {
  tagInput.value?.focus();
};

defineExpose({
  focus,
});
</script> 