import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore(
  'counter',
  () => {
    // State
    const count = ref(0)
    const history = ref<number[]>([])

    // Getters
    const doubleCount = computed(() => count.value * 2)
    const isEven = computed(() => count.value % 2 === 0)
    const historyCount = computed(() => history.value.length)
    const lastValue = computed(() => history.value[history.value.length - 1] ?? 0)

    // Actions
    const increment = () => {
      history.value.push(count.value)
      count.value++
    }

    const decrement = () => {
      history.value.push(count.value)
      count.value--
    }

    const incrementBy = (amount: number) => {
      history.value.push(count.value)
      count.value += amount
    }

    const reset = () => {
      history.value.push(count.value)
      count.value = 0
    }

    const undo = () => {
      if (history.value.length > 0) {
        count.value = history.value.pop() ?? 0
      }
    }

    const clearHistory = () => {
      history.value = []
    }

    return {
      // State
      count,
      history,
      // Getters
      doubleCount,
      isEven,
      historyCount,
      lastValue,
      // Actions
      increment,
      decrement,
      incrementBy,
      reset,
      undo,
      clearHistory,
    }
  },
  {
    persist: {
      key: 'henri-counter',
      storage: localStorage,
    },
  },
)
