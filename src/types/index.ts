// Global type definitions
export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T> {
  data: T
  status: number
  message: string
  success: boolean
}

export type Status = 'idle' | 'loading' | 'success' | 'error'

export interface LoadingState {
  status: Status
  error: string | null
}

// Component props interfaces
export interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

export interface BaseInputProps {
  modelValue: string
  placeholder?: string
  disabled?: boolean
  error?: string
  required?: boolean
}
