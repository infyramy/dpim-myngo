<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

export interface PaginationPreviousProps {
  class?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<PaginationPreviousProps>(), {
  class: '',
  disabled: false,
})

const classes = computed(() => [
  'h-9 w-9',
  props.class,
])
</script>

<template>
  <Button
    :class="classes"
    :disabled="disabled"
    variant="outline"
    size="icon"
  >
    <span class="sr-only">Go to previous page</span>
    <ChevronLeft class="h-4 w-4" />
  </Button>
</template> 