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
          <router-link to="/subscription-plans">Pricing</router-link>
          <router-link v-if="isAuthenticated" to="/dashboard">Dashboard</router-link>
          <div v-if="isAuthenticated" class="dropdown">
            <button class="dropdown-toggle">
              Account
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="dropdown-menu">
              <router-link to="/profile">Profile</router-link>
              <router-link to="/account/billing">Billing</router-link>
              <a href="#" @click.prevent="logout">Logout</a>
            </div>
          </div>
          <router-link v-if="!isAuthenticated" to="/login">Login</router-link>
          <a
            v-if="!isAuthenticated"
            href="#"
            @click.prevent="redirectToRegister"
            class="signup-button"
            >Sign Up</a
          >
        </div>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
    <footer>
      <div class="footer-content">
        <div class="footer-section">
          <h3>Course Champion</h3>
          <p>
            Empowering learners worldwide with high-quality courses and innovative learning tools.
          </p>
        </div>
        <div class="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><router-link to="/">Home</router-link></li>
            <li><router-link to="/courses">Courses</router-link></li>
            <li><router-link to="/subscription-plans">Pricing</router-link></li>
            <li><router-link to="/about">About Us</router-link></li>
          </ul>
        </div>
        <div class="footer-section">
          <h3>Support</h3>
          <ul>
            <li><router-link to="/faq">FAQ</router-link></li>
            <li><router-link to="/contact">Contact Us</router-link></li>
            <li><router-link to="/terms">Terms of Service</router-link></li>
            <li><router-link to="/privacy">Privacy Policy</router-link></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; {{ new Date().getFullYear() }} Course Champion. All rights reserved.</p>
      </div>
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
      localStorage.removeItem('userSubscriptions');
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
    redirectToRegister() {
      this.$router.push('/register');
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
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.logo a {
  color: #4a6bdf;
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-links a {
  color: #555;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-links a:hover {
  color: #4a6bdf;
}

.nav-links a.router-link-active {
  color: #4a6bdf;
}

.signup-button {
  background-color: #4a6bdf;
  color: white !important;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-weight: 500;
}

.signup-button:hover {
  background-color: #3a5bc5;
}

main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #555;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem;
}

.dropdown-toggle:hover {
  color: #4a6bdf;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: white;
  min-width: 160px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  padding: 0.5rem 0;
  z-index: 1;
  display: none;
}

.dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-menu a {
  color: #555;
  padding: 0.75rem 1rem;
  text-decoration: none;
  display: block;
  font-weight: 400;
}

.dropdown-menu a:hover {
  background-color: #f8f9fa;
  color: #4a6bdf;
}

footer {
  background-color: #2c3e50;
  color: white;
  padding: 3rem 2rem 1rem;
  margin-top: 2rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-section h3 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.footer-section p {
  color: #ccc;
  margin-bottom: 1rem;
}

.footer-section ul {
  list-style: none;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section ul li a {
  color: #ccc;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-section ul li a:hover {
  color: white;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  margin-top: 2rem;
  border-top: 1px solid #3a506b;
  color: #ccc;
}

@media (max-width: 768px) {
  nav {
    flex-direction: column;
    padding: 1rem;
  }

  .logo {
    margin-bottom: 1rem;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }

  main {
    padding: 1rem;
  }
}
</style>
