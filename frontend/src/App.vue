<template>
  <div id="app">
    <header>
      <nav>
        <div class="logo">
          <router-link to="/">Course Champion</router-link>
        </div>
        <div class="nav-links">
          <router-link to="/">Home</router-link>
          <router-link to="/courses">Courses</router-link>
          <router-link v-if="isAuthenticated" to="/dashboard">Dashboard</router-link>
          <router-link v-if="!isAuthenticated" to="/login">Login</router-link>
          <a v-else href="#" @click.prevent="logout">Logout</a>
        </div>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
    <footer>
      <p>&copy; {{ new Date().getFullYear() }} Course Champion. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isAuthenticated: false,
    };
  },
  methods: {
    logout() {
      // Clear user authentication
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.isAuthenticated = false;

      // Redirect to home page
      if (this.$route.meta.requiresAuth) {
        this.$router.push('/');
      }
    },
    checkAuthentication() {
      // Check if user is authenticated
      this.isAuthenticated = localStorage.getItem('token') !== null;
    },
  },
  mounted() {
    this.checkAuthentication();

    // Listen for authentication events
    window.addEventListener('storage', event => {
      if (event.key === 'token') {
        this.checkAuthentication();
      }
    });
  },
  watch: {
    $route() {
      this.checkAuthentication();
    },
  },
};
</script>

<style>
/* Reset and base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Roboto', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8f9fa;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: #4a6bdf;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.logo a {
  font-size: 1.6rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  cursor: pointer;
}

.nav-links a:hover {
  color: #e0e0e0;
}

main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

footer {
  background-color: #f1f3f5;
  padding: 1.5rem;
  text-align: center;
  border-top: 1px solid #dee2e6;
}
</style>
