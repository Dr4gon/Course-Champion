<script>
import api from '@/services/api'
import { handleApiError } from '@/services/errorHandler'

export default {
  name: 'StartView',
  data() {
    return {
      userName: 'User',
      notionUrl: '',
      markdownContent: null,
      isLoading: false,
      error: null,
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

    async fetchNotionMarkdown() {
      if (!this.notionUrl) {
        this.error = 'Please enter a Notion page URL'
        return
      }

      this.isLoading = true
      this.error = null
      this.markdownContent = null

      try {
        // Make API call to the Notion import endpoint with markdown format only
        const response = await api.get('/notion/import', {
          params: {
            url: this.notionUrl,
            format: 'markdown', // Only request markdown format
            cache: true,
            children: true,
          },
        })

        // The API interceptor should have already unwrapped the response
        // If data is directly available in the response, it means the interceptor handled it
        if (response && response.markdown) {
          this.markdownContent = response.markdown
        }
        // If we still have a nested structure
        else if (response && response.data && response.data.markdown) {
          this.markdownContent = response.data.markdown
        } else {
          throw new Error('No markdown content found in the response')
        }
      } catch (error) {
        this.error = handleApiError(error, {
          defaultMessage: 'Failed to fetch Notion page. Please check the URL and try again.',
        })
      } finally {
        this.isLoading = false
      }
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

      <!-- Notion Markdown Import Section -->
      <section class="notion-section">
        <div class="section-header">
          <h3>Import Notion Content</h3>
          <span class="markdown-badge">Markdown Only</span>
        </div>

        <div class="form-group">
          <label for="notionUrl">Notion Page URL:</label>
          <input
            type="text"
            id="notionUrl"
            v-model="notionUrl"
            placeholder="https://www.notion.so/Example-Page-123456789abcdef"
          />
        </div>

        <button @click="fetchNotionMarkdown" :aria-busy="isLoading" class="notion-fetch-btn">
          {{ isLoading ? 'Fetching...' : 'Import as Markdown' }}
        </button>

        <div v-if="error" class="error" role="alert">{{ error }}</div>

        <!-- Markdown Content Display -->
        <div v-if="markdownContent" class="markdown-container">
          <div class="markdown-header">
            <h4>Markdown Content</h4>
            <a
              v-if="notionUrl"
              :href="notionUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="view-original"
            >
              View Original
            </a>
          </div>
          <pre class="markdown-content">{{ markdownContent }}</pre>
        </div>
      </section>
    </article>
  </main>
</template>

<style>
article {
  margin-top: 2rem;
}

.notion-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.markdown-badge {
  background-color: #3498db;
  color: white;
  font-size: 0.7rem;
  padding: 0.3rem 0.6rem;
  border-radius: 1rem;
  margin-left: 1rem;
  text-transform: uppercase;
  font-weight: bold;
}

.form-group {
  margin-bottom: 1rem;
}

.notion-fetch-btn {
  margin-bottom: 1rem;
}

.error {
  color: var(--form-element-invalid-border-color);
  margin-bottom: 1rem;
  background-color: rgba(var(--form-element-invalid-border-color-rgb, 230, 76, 76), 0.1);
  padding: 0.5rem;
  border-radius: 0.25rem;
}

.markdown-container {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  border-radius: 0.25rem;
  background-color: #f8f9fa;
}

.markdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.view-original {
  font-size: 0.8rem;
  text-decoration: none;
  color: #3498db;
}

.view-original:hover {
  text-decoration: underline;
}

.markdown-content {
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 0.25rem;
}
</style>
