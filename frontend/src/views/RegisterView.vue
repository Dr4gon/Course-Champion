<script>
export default {
  name: 'RegisterView',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      error: '',
      success: '',
      isLoading: false,
    }
  },
  methods: {
    handleRegister(e) {
      e.preventDefault()

      // Simple validation
      if (!this.name || !this.email || !this.password) {
        this.error = 'Please fill out all fields'
        return
      }

      // Set loading state
      this.isLoading = true
      this.error = ''
      this.success = ''

      // Make API call to the backend registration endpoint
      fetch('/api/users/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.name,
          email: this.email,
          password: this.password,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          this.isLoading = false

          if (data.success) {
            // Registration successful
            this.success = data.message || 'Registration successful!'

            // Clear the form
            this.name = ''
            this.email = ''
            this.password = ''

            // Redirect to login page after delay
            setTimeout(() => {
              this.$router.push('/')
            }, 2000)
          } else {
            // Registration failed
            this.error = data.error || 'Registration failed. Please try again.'
          }
        })
        .catch((err) => {
          this.isLoading = false
          this.error = 'An error occurred while connecting to the server. Please try again later.'
          console.error('Registration error:', err)
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
          <h1>Register</h1>
          <h2>Create a new account</h2>
        </hgroup>

        <form @submit="handleRegister">
          <div v-if="error" class="error" role="alert">{{ error }}</div>
          <div v-if="success" class="success" role="alert">{{ success }}</div>

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

          <button type="submit" :aria-busy="isLoading">
            {{ isLoading ? 'Registering...' : 'Register' }}
          </button>
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
  background-color: rgba(var(--form-element-invalid-border-color-rgb, 230, 76, 76), 0.1);
  padding: 0.5rem;
  border-radius: 0.25rem;
}

.success {
  color: #2ecc71;
  margin-bottom: 1rem;
  background-color: rgba(46, 204, 113, 0.1);
  padding: 0.5rem;
  border-radius: 0.25rem;
}
</style>
