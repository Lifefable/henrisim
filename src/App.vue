<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <nav class="main-nav">
      <div class="nav-brand">
        <h1>🏠 Henri Home</h1>
      </div>
      <div class="nav-links">
        <RouterLink to="/" class="nav-link">Simulation</RouterLink>
        <RouterLink to="/about" class="nav-link">About</RouterLink>
      </div>
    </nav>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  background: #f8fafc;
}

.main-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #4b5563;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: #f3f4f6;
  color: #111827;
}

.nav-link.router-link-active {
  background: #3b82f6;
  color: white;
}

.main-content {
  min-height: calc(100vh - 80px);
  background: #f8fafc;
}

@media (max-width: 768px) {
  .main-nav {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .nav-links {
    gap: 1rem;
  }
}
</style>
