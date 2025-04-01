<script>
export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      error: '',
      isLoading: false,
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

      // Set loading state
      this.isLoading = true
      this.error = ''

      // Make API call to the backend login endpoint
      fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          this.isLoading = false

          if (data.success) {
            // Login successful
            console.log('Login successful:', data)

            // In a real app, you would store user info and token
            // localStorage.setItem('token', data.token)
            // localStorage.setItem('user', JSON.stringify(data.data))

            // Redirect to start page
            this.$router.push('/start')
          } else {
            // Login failed
            this.error = data.error || 'Invalid email or password'
          }
        })
        .catch((err) => {
          this.isLoading = false
          this.error = 'An error occurred while connecting to the server. Please try again later.'
          console.error('Login error:', err)
        })
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

          <button type="submit" :aria-busy="isLoading">
            {{ isLoading ? 'Signing in...' : 'Login' }}
          </button>
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
  background-color: rgba(var(--form-element-invalid-border-color-rgb, 230, 76, 76), 0.1);
  padding: 0.5rem;
  border-radius: 0.25rem;
}
</style>
