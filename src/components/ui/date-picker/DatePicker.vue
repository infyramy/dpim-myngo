<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-vue-next";
import { DateFormatter } from "@internationalized/date";

const props = defineProps<{
  modelValue?: string;
  class?: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", date: string): void;
}>();

const isOpen = ref(false);

// Computed property for displaying the date
const displayText = computed(() => {
  if (!props.modelValue) {
    return props.placeholder || "Pick a date";
  }
  
  try {
    // Parse the ISO string to a Date object and format it nicely
    const date = new Date(props.modelValue);
    if (isNaN(date.getTime())) {
      return props.placeholder || "Pick a date";
    }
    
    // Format the date nicely
    const formatter = new DateFormatter("en-US", {
      year: "numeric",
      month: "long", 
      day: "numeric"
    });
    
    return formatter.format(date);
  } catch {
    return props.placeholder || "Pick a date";
  }
});

function onSelect(date: any) {
  console.log("DatePicker onSelect called with:", date);
  
  if (date) {
    // Convert DateValue to ISO string for the parent component
    let isoString = "";
    
    if (typeof date.toString === 'function') {
      // DateValue has a toString method that returns YYYY-MM-DD format
      const dateStr = date.toString();
      isoString = new Date(dateStr + 'T00:00:00.000Z').toISOString();
    } else {
      isoString = "";
    }
    
    console.log("DatePicker emitting:", isoString);
    emit("update:modelValue", isoString);
  } else {
    emit("update:modelValue", "");
  }
  
  isOpen.value = false;
}
</script>

<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :class="
          cn(
            'w-full justify-start text-left font-normal',
            !props.modelValue && 'text-muted-foreground',
            props.class
          )
        "
      >
        <CalendarIcon class="mr-2 h-4 w-4" />
        {{ displayText }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0">
      <Calendar
        mode="single"
        @update:model-value="onSelect"
        :initial-focus="true"
      />
    </PopoverContent>
  </Popover>
</template>
