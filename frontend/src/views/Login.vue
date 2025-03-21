<template>
  <div class="login-container">
    <div class="form-container">
      <h1>Login</h1>
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required placeholder="your@email.com" />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="Your password"
          />
        </div>

        <div class="error-message" v-if="errorMessage">
          {{ errorMessage }}
        </div>

        <button type="submit" class="btn-submit" :disabled="isLoading">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>

        <div class="form-footer">
          <p>
            Don't have an account?
            <router-link to="/register">Sign up</router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
      isLoading: false,
    };
  },
  methods: {
    async handleSubmit() {
      this.errorMessage = '';
      this.isLoading = true;

      try {
        // Make API call to login endpoint
        // In a real app, this would call the actual login API
        // const response = await api.auth.login({ email: this.email, password: this.password });

        // Simulate API call for demo
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock successful response
        const response = {
          data: {
            success: true,
            token: 'mock-jwt-token-' + Date.now(),
            user: {
              id: 1,
              name: 'Alex Johnson',
              email: this.email,
            },
          },
        };

        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        this.isLoading = false;

        // Redirect to dashboard
        this.$router.push('/dashboard');
      } catch (error) {
        console.error('Login error:', error);
        this.errorMessage = 'Invalid email or password. Please try again.';
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.form-container {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  color: #4a6bdf;
  margin-bottom: 1.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
  color: #333;
}

input {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #4a6bdf;
}

.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.btn-submit {
  background-color: #4a6bdf;
  color: white;
  padding: 0.8rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-submit:hover {
  background-color: #3a5bc5;
}

.btn-submit:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  margin-top: 1rem;
}

.form-footer a {
  color: #4a6bdf;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}
</style>
