import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '@/composables/useApi'
import type { User } from '@/types'

export const useUserStore = defineStore(
  'user',
  () => {
    // State
    const user = ref<User | null>(null)
    const users = ref<User[]>([])

    // Composables
    const api = useApi<User>('/api')

    // Getters
    const loading = computed(() => api.loading.value)
    const error = computed(() => api.error.value)
    const isLoggedIn = computed(() => !!user.value)
    const userCount = computed(() => users.value.length)

    // Actions
    const fetchUser = async (id?: string) => {
      const endpoint = id ? `/users/${id}` : '/user/me'
      const response = await api.get<User>(endpoint)

      if (response?.data) {
        user.value = response.data
      }

      return response
    }

    const fetchUsers = async () => {
      const response = await api.get<User[]>('/users')

      if (response?.data) {
        users.value = response.data
      }

      return response
    }

    const updateUser = async (userData: Partial<User>) => {
      if (!user.value?.id) {
        throw new Error('No user to update')
      }

      const response = await api.put<User>(`/users/${user.value.id}`, userData)

      if (response?.data) {
        user.value = { ...user.value, ...response.data }
      }

      return response
    }

    const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await api.post<User>('/users', {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      if (response?.data) {
        users.value.push(response.data)
      }

      return response
    }

    const deleteUser = async (id: string) => {
      const response = await api.delete(`/users/${id}`)

      if (response) {
        users.value = users.value.filter((u) => u.id !== id)
        if (user.value?.id === id) {
          user.value = null
        }
      }

      return response
    }

    const refreshUser = async () => {
      if (user.value?.id) {
        return fetchUser(user.value.id)
      }
      return fetchUser()
    }

    const logout = () => {
      user.value = null
      api.reset()
    }

    const setUser = (userData: User) => {
      user.value = userData
    }

    // Simulate login (for demo purposes)
    const simulateLogin = () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
      }
      setUser(mockUser)
    }

    return {
      // State
      user,
      users,
      // Getters
      loading,
      error,
      isLoggedIn,
      userCount,
      // Actions
      fetchUser,
      fetchUsers,
      updateUser,
      createUser,
      deleteUser,
      refreshUser,
      logout,
      setUser,
      simulateLogin,
    }
  },
  {
    persist: {
      key: 'henri-user',
      storage: localStorage,
    },
  },
)
