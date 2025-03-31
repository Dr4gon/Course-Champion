<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  // In a real app, you would clear authentication token here
  router.push('/')
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
        <h1>Welcome to CourseChampion</h1>
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
