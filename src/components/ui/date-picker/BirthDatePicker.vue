<script setup lang="ts">
import { ref, watch, computed } from "vue";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-vue-next";

const props = defineProps<{
  modelValue?: string;
  class?: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", date: string): void;
}>();

const isOpen = ref(false);
const selectedYear = ref<string>("");
const selectedMonth = ref<string>("");
const selectedDay = ref<string>("");

// Generate years from 1924 to current year
const currentYear = new Date().getFullYear();
const years = computed(() => {
  const yearList = [];
  for (let year = currentYear; year >= 1924; year--) {
    yearList.push({ value: year.toString(), label: year.toString() });
  }
  return yearList;
});

// Months array
const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

// Generate days based on selected year and month
const days = computed(() => {
  if (!selectedYear.value || !selectedMonth.value) {
    return [];
  }
  
  const year = parseInt(selectedYear.value);
  const month = parseInt(selectedMonth.value);
  const daysInMonth = new Date(year, month, 0).getDate(); // Get number of days in the month
  
  const dayList = [];
  for (let day = 1; day <= daysInMonth; day++) {
    dayList.push({ 
      value: day.toString(), 
      label: day.toString().padStart(2, '0') 
    });
  }
  return dayList;
});

// Initialize from modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const date = new Date(newValue);
    if (!isNaN(date.getTime())) {
      selectedYear.value = date.getFullYear().toString();
      selectedMonth.value = (date.getMonth() + 1).toString();
      selectedDay.value = date.getDate().toString();
    }
  } else {
    selectedYear.value = "";
    selectedMonth.value = "";
    selectedDay.value = "";
  }
}, { immediate: true });

// Watch for changes and emit the combined date
watch([selectedYear, selectedMonth, selectedDay], ([year, month, day]) => {
  if (year && month && day) {
    // Create date in YYYY-MM-DD format
    const paddedMonth = month.padStart(2, '0');
    const paddedDay = day.padStart(2, '0');
    const dateString = `${year}-${paddedMonth}-${paddedDay}`;
    const isoString = new Date(dateString + 'T00:00:00.000Z').toISOString();
    emit("update:modelValue", isoString);
  }
});

// Reset day when year or month changes (in case the day becomes invalid)
watch([selectedYear, selectedMonth], () => {
  if (selectedDay.value && days.value.length > 0) {
    const dayExists = days.value.some(d => d.value === selectedDay.value);
    if (!dayExists) {
      selectedDay.value = "";
    }
  }
});

// Computed property for displaying the date
const displayText = computed(() => {
  if (!props.modelValue) {
    return props.placeholder || "Pick your birth date";
  }
  
  try {
    const date = new Date(props.modelValue);
    if (isNaN(date.getTime())) {
      return props.placeholder || "Pick your birth date";
    }
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", 
      day: "numeric"
    });
  } catch {
    return props.placeholder || "Pick your birth date";
  }
});

function clearDate() {
  selectedYear.value = "";
  selectedMonth.value = "";
  selectedDay.value = "";
  emit("update:modelValue", "");
}

function closePopover() {
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
      <div class="p-4 space-y-4">
        <h4 class="text-sm font-medium text-center">Select Your Birth Date</h4>
        
        <!-- Year Selection -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Year</label>
          <Select v-model="selectedYear">
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent class="max-h-60">
              <SelectItem v-for="year in years" :key="year.value" :value="year.value">
                {{ year.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Month Selection -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Month</label>
          <Select v-model="selectedMonth" :disabled="!selectedYear">
            <SelectTrigger>
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="month in months" :key="month.value" :value="month.value">
                {{ month.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Day Selection -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Day</label>
          <Select v-model="selectedDay" :disabled="!selectedYear || !selectedMonth">
            <SelectTrigger>
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent class="max-h-60">
              <SelectItem v-for="day in days" :key="day.value" :value="day.value">
                {{ day.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Action buttons -->
        <div class="flex justify-between pt-4 border-t">
          <Button variant="outline" size="sm" @click="clearDate">
            Clear
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            @click="closePopover"
            :disabled="!selectedYear || !selectedMonth || !selectedDay"
          >
            Done
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template> 