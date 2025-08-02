import { ref, watch } from 'vue'
import type { Ref } from 'vue'

/**
 * Composable for reactive localStorage management
 * Automatically syncs reactive data with localStorage
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: {
    serializer?: {
      read: (value: string) => T
      write: (value: T) => string
    }
  } = {},
): [Ref<T>, (value: T) => void, () => void] {
  const {
    serializer = {
      read: (v: string) => {
        try {
          return JSON.parse(v)
        } catch {
          return v as T
        }
      },
      write: (v: T) => JSON.stringify(v),
    },
  } = options

  const read = (): T => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        return defaultValue
      }
      return serializer.read(item)
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  }

  const write = (value: T): void => {
    try {
      localStorage.setItem(key, serializer.write(value))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  const remove = (): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }

  // Initialize reactive reference
  const storedValue = ref(read()) as Ref<T>

  // Update localStorage when reactive value changes
  watch(
    storedValue,
    (newValue) => {
      if (newValue === null || newValue === undefined) {
        remove()
      } else {
        write(newValue)
      }
    },
    { deep: true },
  )

  // Listen for localStorage changes from other tabs/windows
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === key && e.newValue !== serializer.write(storedValue.value)) {
      storedValue.value = e.newValue ? serializer.read(e.newValue) : defaultValue
    }
  }

  window.addEventListener('storage', handleStorageChange)

  const setValue = (value: T) => {
    storedValue.value = value
  }

  const removeValue = () => {
    storedValue.value = defaultValue
    remove()
  }

  return [storedValue, setValue, removeValue]
}

/**
 * Composable for managing user preferences in localStorage
 */
export function useUserPreferences() {
  const [theme, setTheme] = useLocalStorage('user-theme', 'light')
  const [language, setLanguage] = useLocalStorage('user-language', 'en')
  const [fontSize, setFontSize] = useLocalStorage('user-font-size', 'medium')
  const [sidebar, setSidebar] = useLocalStorage('sidebar-collapsed', false)

  const toggleTheme = () => {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  const toggleSidebar = () => {
    setSidebar(!sidebar.value)
  }

  return {
    theme,
    language,
    fontSize,
    sidebar,
    setTheme,
    setLanguage,
    setFontSize,
    setSidebar,
    toggleTheme,
    toggleSidebar,
  }
}
