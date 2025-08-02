import { ref, computed } from 'vue'
import type { ApiResponse, LoadingState } from '@/types'

/**
 * Composable for making API requests with loading and error states
 */
export function useApi<T>(baseUrl?: string) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const state = computed(
    (): LoadingState => ({
      status: loading.value ? 'loading' : error.value ? 'error' : data.value ? 'success' : 'idle',
      error: error.value,
    }),
  )

  const request = async <R = T>(
    url: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<R> | null> => {
    loading.value = true
    error.value = null

    try {
      const fullUrl = baseUrl ? `${baseUrl}${url}` : url
      const response = await fetch(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<R> = await response.json()
      data.value = result.data as unknown as T
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      error.value = errorMessage
      console.error('API request failed:', errorMessage)
      return null
    } finally {
      loading.value = false
    }
  }

  const get = <R = T>(url: string, options?: RequestInit) =>
    request<R>(url, { ...options, method: 'GET' })

  const post = <R = T>(url: string, body?: unknown, options?: RequestInit) =>
    request<R>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })

  const put = <R = T>(url: string, body?: unknown, options?: RequestInit) =>
    request<R>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })

  const del = <R = T>(url: string, options?: RequestInit) =>
    request<R>(url, { ...options, method: 'DELETE' })

  const reset = () => {
    data.value = null
    loading.value = false
    error.value = null
  }

  return {
    data,
    loading,
    error,
    state,
    request,
    get,
    post,
    put,
    delete: del,
    reset,
  }
}
