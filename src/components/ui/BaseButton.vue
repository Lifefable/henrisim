<template>
    <button :class="[
        'base-button',
        `base-button--${variant}`,
        `base-button--${size}`,
        {
            'base-button--disabled': disabled,
            'base-button--loading': loading
        }
    ]" :disabled="disabled || loading" @click="handleClick">
        <span v-if="loading" class="base-button__spinner">⟳</span>
        <slot v-else />
    </button>
</template>

<script setup lang="ts">
import type { BaseButtonProps } from '@/types'

const props = withDefaults(defineProps<BaseButtonProps>(), {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false
})

const emit = defineEmits<{
    click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
    if (!props.disabled && !props.loading) {
        emit('click', event)
    }
}
</script>

<style scoped>
.base-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: 0.375rem;
    font-weight: 500;
    text-align: center;
    transition: all 0.15s ease-in-out;
    cursor: pointer;
    font-family: inherit;
    text-decoration: none;
}

.base-button:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
}

/* Sizes */
.base-button--sm {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
}

.base-button--md {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
}

.base-button--lg {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    line-height: 1.5rem;
}

/* Variants */
.base-button--primary {
    background-color: #3b82f6;
    border-color: #3b82f6;
    color: white;
}

.base-button--primary:hover:not(.base-button--disabled):not(.base-button--loading) {
    background-color: #2563eb;
    border-color: #2563eb;
}

.base-button--secondary {
    background-color: #6b7280;
    border-color: #6b7280;
    color: white;
}

.base-button--secondary:hover:not(.base-button--disabled):not(.base-button--loading) {
    background-color: #4b5563;
    border-color: #4b5563;
}

.base-button--danger {
    background-color: #ef4444;
    border-color: #ef4444;
    color: white;
}

.base-button--danger:hover:not(.base-button--disabled):not(.base-button--loading) {
    background-color: #dc2626;
    border-color: #dc2626;
}

.base-button--ghost {
    background-color: transparent;
    border-color: #d1d5db;
    color: #374151;
}

.base-button--ghost:hover:not(.base-button--disabled):not(.base-button--loading) {
    background-color: #f3f4f6;
    border-color: #9ca3af;
}

/* States */
.base-button--disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.base-button--loading {
    cursor: not-allowed;
}

.base-button__spinner {
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>
