<template>
    <div class="user-profile">
        <div v-if="userStore.loading" class="user-profile__loading">
            Loading user data...
        </div>

        <div v-else-if="userStore.error" class="user-profile__error">
            Error: {{ userStore.error }}
            <BaseButton @click="() => userStore.fetchUser()" variant="ghost" size="sm">
                Retry
            </BaseButton>
        </div>

        <div v-else-if="userStore.user" class="user-profile__content">
            <h2>{{ userStore.user.name }}</h2>
            <p>{{ userStore.user.email }}</p>
            <p class="user-profile__date">
                Member since: {{ formatDate(userStore.user.createdAt) }}
            </p>

            <div class="user-profile__actions">
                <BaseButton @click="editMode = !editMode">
                    {{ editMode ? 'Cancel' : 'Edit Profile' }}
                </BaseButton>
                <BaseButton @click="userStore.refreshUser" variant="secondary">
                    Refresh
                </BaseButton>
            </div>

            <form v-if="editMode" @submit.prevent="handleSave" class="user-profile__form">
                <BaseInput v-model="editForm.name" label="Name" required :error="errors.name" />
                <BaseInput v-model="editForm.email" label="Email" type="email" required :error="errors.email" />
                <div class="user-profile__form-actions">
                    <BaseButton type="submit" :loading="saving">
                        Save Changes
                    </BaseButton>
                    <BaseButton @click="editMode = false" variant="ghost">
                        Cancel
                    </BaseButton>
                </div>
            </form>
        </div>

        <div v-else class="user-profile__empty">
            <p>No user data available</p>
            <BaseButton @click="() => userStore.fetchUser()">
                Load User
            </BaseButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useUserStore } from '../../stores/user'
import { formatDate } from '@/utils'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const userStore = useUserStore()
const editMode = ref(false)
const saving = ref(false)

// Form data for editing
const editForm = reactive({
    name: '',
    email: ''
})

// Form validation errors
const errors = reactive({
    name: '',
    email: ''
})

// Watch for user changes to populate edit form
watch(() => userStore.user, (user) => {
    if (user) {
        editForm.name = user.name
        editForm.email = user.email
    }
}, { immediate: true })

// Validate form
const validateForm = (): boolean => {
    errors.name = ''
    errors.email = ''

    if (!editForm.name.trim()) {
        errors.name = 'Name is required'
    }

    if (!editForm.email.trim()) {
        errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
        errors.email = 'Please enter a valid email address'
    }

    return !errors.name && !errors.email
}

// Handle form submission
const handleSave = async () => {
    if (!validateForm()) return

    saving.value = true
    try {
        await userStore.updateUser({
            name: editForm.name,
            email: editForm.email
        })
        editMode.value = false
    } catch (error) {
        console.error('Failed to save user:', error)
    } finally {
        saving.value = false
    }
}

// Load user data on component mount
userStore.fetchUser()
</script>

<style scoped>
.user-profile {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
}

.user-profile__loading,
.user-profile__error,
.user-profile__empty {
    text-align: center;
    padding: 2rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    background-color: var(--color-background-soft);
}

.user-profile__error {
    color: #ef4444;
}

.user-profile__content h2 {
    margin-bottom: 0.5rem;
    color: var(--color-heading);
}

.user-profile__date {
    color: var(--color-text-light);
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
}

.user-profile__actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
}

.user-profile__form {
    border-top: 1px solid var(--color-border);
    padding-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.user-profile__form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

@media (max-width: 768px) {
    .user-profile {
        padding: 1rem;
    }

    .user-profile__actions,
    .user-profile__form-actions {
        flex-direction: column;
    }
}
</style>
