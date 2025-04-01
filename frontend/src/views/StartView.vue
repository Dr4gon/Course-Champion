<script>
export default {
  name: 'StartView',
  data() {
    return {
      userName: 'User',
    }
  },
  mounted() {
    // In a real app, you would get user info from localStorage or a state management system
    // For now, we'll just set a placeholder name
    // Example: const user = JSON.parse(localStorage.getItem('user'))
    // if (user) this.userName = user.name
  },
  methods: {
    handleLogout() {
      // In a real app, you would clear authentication token here
      // Example: localStorage.removeItem('token')
      // localStorage.removeItem('user')

      // Redirect to login page
      this.$router.push('/')
    },
  },
}
</script>

<template>
  <main class="container">
    <article>
      <header>
        <nav>
          <ul>
            <li><strong>CourseChampion</strong></li>
          </ul>
          <ul>
            <li><a href="#" @click="handleLogout">Logout</a></li>
          </ul>
        </nav>
      </header>

      <hgroup>
        <h1>Welcome to CourseChampion, {{ userName }}</h1>
        <h2>Your learning journey starts here</h2>
      </hgroup>

      <p>
        This is a simple start page. In a complete application, this would show your courses,
        progress, and learning resources.
      </p>
    </article>
  </main>
</template>

<style>
article {
  margin-top: 2rem;
}
</style>
