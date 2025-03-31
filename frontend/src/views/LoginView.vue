<script>
export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      error: '',
    }
  },
  methods: {
    handleLogin(e) {
      e.preventDefault()

      // Simple validation
      if (!this.email || !this.password) {
        this.error = 'Please enter both email and password'
        return
      }

      // Here you would normally call an API
      // For this example, just simulate a login and redirect
      console.log('Login with:', this.email)

      // Simulate success and redirect to start page
      setTimeout(() => {
        this.$router.push('/start')
      }, 500)
    },
  },
}
</script>

<template>
  <main class="container">
    <article class="grid" style="margin-top: 2rem">
      <div></div>
      <div>
        <hgroup>
          <h1>Login</h1>
          <h2>Please sign in to continue</h2>
        </hgroup>

        <form @submit="handleLogin">
          <div v-if="error" class="error" role="alert">{{ error }}</div>

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

          <button type="submit">Login</button>
        </form>

        <p>Don't have an account? <router-link to="/register">Register</router-link></p>
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
