<script>
import api from '@/services/api'
import { handleApiError } from '@/services/errorHandler'
import MarkdownIt from 'markdown-it'
import markdownItAttrs from 'markdown-it-attrs'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItTaskLists from 'markdown-it-task-lists'

export default {
  name: 'StartView',
  data() {
    return {
      userName: 'User',
      notionUrl: '',
      markdownContent: null,
      renderedHTML: null,
      pageData: null,
      isLoading: false,
      error: null,
      md: null,
    }
  },
  created() {
    // Initialize markdown-it with plugins
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      breaks: true,
    })
      .use(markdownItAttrs)
      .use(markdownItAnchor, {
        permalink: true,
        permalinkSymbol: '#',
        permalinkClass: 'header-anchor',
      })
      .use(markdownItTaskLists, { enabled: true, label: true, labelAfter: true })
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
      this.renderedHTML = null
      this.pageData = null

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

        // Store the page data for title, last updated, etc.
        this.pageData = response

        // The API interceptor should have already unwrapped the response
        // If data is directly available in the response, it means the interceptor handled it
        if (response && response.markdown) {
          this.markdownContent = response.markdown
          this.renderMarkdown()
        }
        // If we still have a nested structure
        else if (response && response.data && response.data.markdown) {
          this.markdownContent = response.data.markdown
          this.pageData = response.data
          this.renderMarkdown()
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

    renderMarkdown() {
      if (this.markdownContent) {
        this.renderedHTML = this.md.render(this.markdownContent)
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
            placeholder="https://www.notion.so/user/Page-Title-a1b2c3d4e5f6"
          />
          <small class="input-help"
            >Paste a public Notion page URL to import its content as beautifully rendered
            markdown</small
          >
        </div>

        <button @click="fetchNotionMarkdown" :aria-busy="isLoading" class="notion-fetch-btn">
          {{ isLoading ? 'Fetching Content...' : 'Import & Render Content' }}
        </button>

        <div v-if="error" class="error" role="alert">{{ error }}</div>

        <!-- Rendered Content Display -->
        <div v-if="renderedHTML" class="markdown-container">
          <div class="markdown-header">
            <h4>{{ pageData && pageData.title ? pageData.title : 'Notion Content' }}</h4>
            <div class="actions">
              <span v-if="pageData && pageData.lastUpdated" class="last-updated">
                Last updated: {{ new Date(pageData.lastUpdated).toLocaleString() }}
              </span>
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
          </div>
          <div class="notion-content-wrapper">
            <div class="markdown-rendered notion-content" v-html="renderedHTML"></div>
          </div>

          <!-- Toggle for Raw Markdown -->
          <details class="raw-markdown-toggle">
            <summary>View Raw Markdown</summary>
            <pre class="markdown-content">{{ markdownContent }}</pre>
          </details>
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

.input-help {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6c757d;
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
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.75rem;
}

.markdown-header h4 {
  margin: 0;
  font-size: 1.25rem;
  color: #343a40;
}

.actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.last-updated {
  font-size: 0.8rem;
  color: #6c757d;
}

.view-original {
  font-size: 0.8rem;
  text-decoration: none;
  color: #3498db;
}

.view-original:hover {
  text-decoration: underline;
}

.markdown-rendered {
  line-height: 1.6;
  max-height: 600px;
  overflow-y: auto;
  padding: 1rem;
  background-color: white;
  border-radius: 0.25rem;
  border: 1px solid #e9ecef;
}

/* Styling for the rendered markdown content */
.markdown-rendered h1,
.markdown-rendered h2,
.markdown-rendered h3,
.markdown-rendered h4,
.markdown-rendered h5,
.markdown-rendered h6 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-rendered h1 {
  font-size: 2em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-rendered h2 {
  font-size: 1.5em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-rendered h3 {
  font-size: 1.25em;
}

.markdown-rendered h4 {
  font-size: 1em;
}

.markdown-rendered h5 {
  font-size: 0.875em;
}

.markdown-rendered h6 {
  font-size: 0.85em;
  color: #6a737d;
}

.markdown-rendered p {
  margin-top: 0;
  margin-bottom: 1rem;
}

.markdown-rendered a {
  color: #0366d6;
  text-decoration: none;
}

.markdown-rendered a:hover {
  text-decoration: underline;
}

.markdown-rendered img {
  max-width: 100%;
  height: auto;
}

.markdown-rendered table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1rem;
}

.markdown-rendered table th,
.markdown-rendered table td {
  padding: 0.5rem;
  border: 1px solid #dfe2e5;
}

.markdown-rendered table th {
  background-color: #f6f8fa;
  font-weight: 600;
}

.markdown-rendered blockquote {
  margin: 0 0 1rem;
  padding: 0 1rem;
  color: #6a737d;
  border-left: 0.25rem solid #dfe2e5;
}

.markdown-rendered ul,
.markdown-rendered ol {
  padding-left: 2rem;
  margin-bottom: 1rem;
}

.markdown-rendered code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.markdown-rendered pre {
  padding: 1rem;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 3px;
  margin-bottom: 1rem;
}

.markdown-rendered pre code {
  padding: 0;
  background-color: transparent;
}

.raw-markdown-toggle {
  margin-top: 1.5rem;
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
}

.raw-markdown-toggle summary {
  cursor: pointer;
  color: #6c757d;
  font-size: 0.875rem;
  user-select: none;
}

.raw-markdown-toggle summary:hover {
  color: #3498db;
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
  margin-top: 1rem;
}

.notion-content-wrapper {
  border: 1px solid #e9ecef;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.notion-content {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: #212529;
  padding: 2rem;
  max-height: 700px;
}

/* Header anchors for navigation */
.header-anchor {
  opacity: 0;
  margin-left: 0.5rem;
  text-decoration: none;
  color: #6c757d;
  font-size: 0.8em;
  transition: opacity 0.2s ease-in-out;
}

.markdown-rendered h1:hover .header-anchor,
.markdown-rendered h2:hover .header-anchor,
.markdown-rendered h3:hover .header-anchor,
.markdown-rendered h4:hover .header-anchor,
.markdown-rendered h5:hover .header-anchor,
.markdown-rendered h6:hover .header-anchor {
  opacity: 1;
}

/* Task lists (checkboxes) */
.task-list-item {
  list-style-type: none;
  margin-left: -2rem;
  padding-left: 0;
}

.task-list-item-checkbox {
  margin-right: 0.5rem;
}

/* Additional Notion-specific styling */
.notion-content .callout {
  padding: 16px;
  border-radius: 3px;
  margin: 1rem 0;
  display: flex;
  border-left: 4px solid #e9ecef;
  background-color: #f8f9fa;
}

.notion-content .callout-blue {
  border-left-color: #4299e1;
  background-color: rgba(66, 153, 225, 0.1);
}

.notion-content .callout-green {
  border-left-color: #48bb78;
  background-color: rgba(72, 187, 120, 0.1);
}

.notion-content .callout-red {
  border-left-color: #f56565;
  background-color: rgba(245, 101, 101, 0.1);
}

.notion-content .callout-yellow {
  border-left-color: #ecc94b;
  background-color: rgba(236, 201, 75, 0.1);
}

.notion-content .callout-emoji {
  margin-right: 12px;
  flex-shrink: 0;
}

.notion-content hr {
  height: 1px;
  border: none;
  background-color: #e9ecef;
  margin: 2rem 0;
}

.notion-content .todo-list {
  list-style-type: none;
  padding-left: 0;
}

.notion-content .todo-list li {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.notion-content .todo-checkbox {
  margin-right: 10px;
  width: 16px;
  height: 16px;
}
</style>
