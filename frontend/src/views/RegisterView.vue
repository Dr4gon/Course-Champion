<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')

const handleRegister = async (e) => {
  e.preventDefault()

  // Simple validation
  if (!name.value || !email.value || !password.value) {
    error.value = 'Please fill out all fields'
    return
  }

  // Here you would normally call an API
  // For this example, just simulate a registration and redirect
  console.log('Register with:', name.value, email.value)

  // Simulate success and redirect to login page
  setTimeout(() => {
    router.push('/')
  }, 500)
}
</script>

<template>
  <main class="container">
    <article class="grid" style="margin-top: 2rem">
      <div></div>
      <div>
        <hgroup>
          <h1>Register</h1>
          <h2>Create a new account</h2>
        </hgroup>

        <form @submit="handleRegister">
          <div v-if="error" class="error" role="alert">{{ error }}</div>

          <label for="name">
            Name
            <input
              type="text"
              id="name"
              name="name"
              v-model="name"
              placeholder="Your name"
              required
            />
          </label>

          <label for="email">
            Email
            <input
              type="email"
              id="email"
              name="email"
              v-model="email"
              placeholder="your@email.com"
              required
            />
          </label>

          <label for="password">
            Password
            <input
              type="password"
              id="password"
              name="password"
              v-model="password"
              placeholder="Your password"
              required
            />
          </label>

          <button type="submit">Register</button>
        </form>

        <p>Already have an account? <router-link to="/">Login</router-link></p>
      </div>
      <div></div>
    </article>
  </main>
</template>

<style>
article {
  padding: 1rem;
  max-width: 30rem;
  margin: 0 auto;
}

.error {
  color: var(--form-element-invalid-border-color);
  margin-bottom: 1rem;
}
</style>
