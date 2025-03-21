<template>
  <div class="register-container">
    <div class="form-container">
      <h1>Create an Account</h1>
      <form @submit.prevent="handleSubmit" class="register-form">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" v-model="name" required placeholder="John Doe" />
        </div>

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
            placeholder="Create a strong password"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            required
            placeholder="Confirm your password"
          />
        </div>

        <div class="error-message" v-if="errorMessage">
          {{ errorMessage }}
        </div>

        <div class="success-message" v-if="registrationSuccess">
          Registration successful! Redirecting to login...
        </div>

        <button type="submit" class="btn-submit" :disabled="isLoading">
          {{ isLoading ? 'Creating Account...' : 'Sign Up' }}
        </button>

        <div class="form-footer">
          <p>
            Already have an account?
            <router-link to="/login">Login</router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'Register',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      errorMessage: '',
      registrationSuccess: false,
      isLoading: false,
    };
  },
  methods: {
    async handleSubmit() {
      this.errorMessage = '';
      this.registrationSuccess = false;

      // Form validation
      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Passwords do not match';
        return;
      }

      if (this.password.length < 8) {
        this.errorMessage = 'Password must be at least 8 characters long';
        return;
      }

      this.isLoading = true;

      try {
        // In a real app, this would call the actual registration API
        // const response = await api.auth.register({
        //   name: this.name,
        //   email: this.email,
        //   password: this.password
        // });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock successful response
        const response = {
          data: {
            success: true,
            message: 'User registered successfully',
            user: {
              id: Date.now(),
              name: this.name,
              email: this.email,
            },
          },
        };

        this.isLoading = false;
        this.registrationSuccess = true;

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          this.$router.push('/login');
        }, 2000);
      } catch (error) {
        console.error('Registration error:', error);

        // Check for specific error responses
        if (error.response && error.response.data) {
          if (error.response.data.error === 'email_exists') {
            this.errorMessage =
              'This email is already registered. Please use a different email or login.';
          } else {
            this.errorMessage =
              error.response.data.message || 'Registration failed. Please try again.';
          }
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }

        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem 0;
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

.register-form {
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

.success-message {
  color: #2ecc71;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
  padding: 0.5rem;
  background-color: #e8f8f5;
  border-radius: 4px;
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
