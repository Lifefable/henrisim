<template>
    <div class="base-input">
        <label v-if="label" :for="inputId" class="base-input__label">
            {{ label }}
            <span v-if="required" class="base-input__required">*</span>
        </label>
        <input :id="inputId" :type="type" :value="modelValue" :placeholder="placeholder" :disabled="disabled"
            :required="required" :class="[
                'base-input__field',
                {
                    'base-input__field--error': error,
                    'base-input__field--disabled': disabled
                }
            ]" @input="handleInput" @blur="handleBlur" @focus="handleFocus" />
        <p v-if="error" class="base-input__error">{{ error }}</p>
        <p v-else-if="hint" class="base-input__hint">{{ hint }}</p>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { generateId } from '@/utils'
import type { BaseInputProps } from '@/types'

interface Props extends BaseInputProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
    label?: string
    hint?: string
}

withDefaults(defineProps<Props>(), {
    type: 'text',
    disabled: false,
    required: false
})

const emit = defineEmits<{
    'update:modelValue': [value: string]
    blur: [event: FocusEvent]
    focus: [event: FocusEvent]
}>()

const inputId = computed(() => `input-${generateId()}`)

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    emit('update:modelValue', target.value)
}

const handleBlur = (event: FocusEvent) => {
    emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
    emit('focus', event)
}
</script>

<style scoped>
.base-input {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.base-input__label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    line-height: 1.5;
}

.base-input__required {
    color: #ef4444;
}

.base-input__field {
    display: block;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #111827;
    background-color: white;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.base-input__field:focus {
    outline: 0;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

.base-input__field::placeholder {
    color: #9ca3af;
}

.base-input__field--error {
    border-color: #ef4444;
}

.base-input__field--error:focus {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgb(239 68 68 / 0.1);
}

.base-input__field--disabled {
    background-color: #f9fafb;
    color: #6b7280;
    cursor: not-allowed;
}

.base-input__error {
    font-size: 0.75rem;
    color: #ef4444;
    margin: 0;
}

.base-input__hint {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0;
}
</style>
