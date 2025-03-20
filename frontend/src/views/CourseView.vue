<template>
  <div class="course-view-container">
    <div v-if="loading" class="loading-indicator">Loading course...</div>

    <div v-else-if="!course" class="not-found">
      <h2>Course Not Found</h2>
      <p>The course you're looking for doesn't exist or has been removed.</p>
      <router-link to="/courses" class="btn-back">Back to Courses</router-link>
    </div>

    <div v-else>
      <div class="course-header">
        <h1>{{ course.title }}</h1>
        <div class="course-meta">
          <span class="instructor">Instructor: {{ course.instructor }}</span>
          <span class="level">Level: {{ course.level }}</span>
        </div>
      </div>

      <div class="content-layout">
        <div class="main-content">
          <VideoPlayer
            v-if="currentLesson && currentLesson.videoUrl"
            :videoSrc="currentLesson.videoUrl"
            :posterSrc="course.thumbnail"
          />

          <div class="lesson-content" v-if="currentLesson">
            <h2>{{ currentLesson.title }}</h2>
            <div
              class="lesson-description"
              v-html="currentLesson.content"
            ></div>

            <div
              class="lesson-resources"
              v-if="currentLesson.resources.length > 0"
            >
              <h3>Resources</h3>
              <ul>
                <li
                  v-for="(resource, index) in currentLesson.resources"
                  :key="index"
                >
                  <a
                    :href="resource.url"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ resource.title }}
                  </a>
                </li>
              </ul>
            </div>

            <NotionIntegration
              :courseId="course.id"
              :lessonId="currentLesson.id"
              @notion-connected="handleNotionConnected"
              @notion-synced="handleNotionSynced"
            />
          </div>
        </div>

        <div class="sidebar">
          <div class="course-progress">
            <div class="progress-text">
              {{ completedLessons.length }} of
              {{ course.lessons.length }} lessons completed
            </div>
            <div class="progress-bar-container">
              <div
                class="progress-bar"
                :style="{ width: `${progressPercentage}%` }"
              ></div>
            </div>
          </div>

          <div class="lessons-list">
            <h3>Course Content</h3>
            <div
              v-for="(lesson, index) in course.lessons"
              :key="lesson.id"
              class="lesson-item"
              :class="{
                active: currentLessonId === lesson.id,
                completed: completedLessons.includes(lesson.id),
                locked: !isLessonAvailable(lesson),
              }"
              @click="selectLesson(lesson)"
            >
              <div class="lesson-number">{{ index + 1 }}</div>
              <div class="lesson-info">
                <div class="lesson-title">{{ lesson.title }}</div>
                <div class="lesson-duration">{{ lesson.duration }}</div>
              </div>
              <div class="lesson-status">
                <span v-if="completedLessons.includes(lesson.id)">✓</span>
                <span v-else-if="!isLessonAvailable(lesson)">🔒</span>
                <span v-else>▶</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VideoPlayer from "../components/VideoPlayer.vue";
import NotionIntegration from "../components/NotionIntegration.vue";

export default {
  name: "CourseView",
  components: {
    VideoPlayer,
    NotionIntegration,
  },
  data() {
    return {
      loading: true,
      course: null,
      currentLessonId: null,
      completedLessons: [],
      // Mock data for development
      mockCourse: {
        id: 1,
        title: "Introduction to Web Development",
        instructor: "John Smith",
        description:
          "Learn the basics of HTML, CSS, and JavaScript to build modern websites.",
        duration: "8 weeks",
        level: "Beginner",
        category: "programming",
        price: "$49.99",
        thumbnail: "https://via.placeholder.com/300x200?text=Web+Development",
        lessons: [
          {
            id: 101,
            title: "Getting Started with HTML",
            duration: "15 min",
            videoUrl:
              "https://cdn.videvo.net/videvo_files/video/premium/video0042/small_watermarked/601_601-0118_preview.mp4",
            content:
              "<p>This lesson introduces you to the basics of HTML. You'll learn about HTML elements, attributes, and document structure.</p><p>HTML (Hypertext Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page and consists of a series of elements that tell the browser how to display the content.</p>",
            resources: [
              { title: "HTML Cheat Sheet", url: "#" },
              { title: "HTML Documentation", url: "#" },
            ],
            releaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          },
          {
            id: 102,
            title: "CSS Fundamentals",
            duration: "20 min",
            videoUrl:
              "https://cdn.videvo.net/videvo_files/video/premium/video0036/small_watermarked/372_372-0007_preview.mp4",
            content:
              "<p>This lesson covers the fundamentals of CSS. You'll learn how to style HTML elements, work with selectors, and apply layouts.</p><p>CSS (Cascading Style Sheets) is a stylesheet language used for describing the presentation of a document written in HTML. CSS describes how elements should be rendered on screen, on paper, in speech, or on other media.</p>",
            resources: [
              { title: "CSS Cheat Sheet", url: "#" },
              { title: "CSS Reference", url: "#" },
            ],
            releaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          },
          {
            id: 103,
            title: "JavaScript Basics",
            duration: "25 min",
            videoUrl:
              "https://cdn.videvo.net/videvo_files/video/premium/video0034/small_watermarked/TYPING_INTRO_1_preview.mp4",
            content:
              "<p>This lesson introduces you to JavaScript basics. You'll learn about variables, data types, functions, and control flow.</p><p>JavaScript is a programming language that enables interactive web pages. It is an essential part of web applications, and the vast majority of websites use it for client-side page behavior.</p>",
            resources: [
              { title: "JavaScript Reference", url: "#" },
              { title: "JavaScript Tutorial", url: "#" },
            ],
            releaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          },
          {
            id: 104,
            title: "Responsive Web Design",
            duration: "30 min",
            videoUrl:
              "https://cdn.videvo.net/videvo_files/video/premium/video0031/small_watermarked/Tablet_Hand_preview.mp4",
            content:
              "<p>This lesson focuses on responsive web design techniques. You'll learn how to make your websites look good on all devices.</p><p>Responsive web design is an approach to web design that makes web pages render well on a variety of devices and window or screen sizes. It uses HTML and CSS to resize, hide, shrink, enlarge, or move content to make it look good on any screen.</p>",
            resources: [
              { title: "Media Queries Reference", url: "#" },
              { title: "Responsive Design Guidelines", url: "#" },
            ],
            releaseDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now (locked)
          },
        ],
      },
    };
  },
  methods: {
    handleNotionConnected(data) {
      console.log("Notion connected:", data);
      // In a real app, you would update the lesson with the Notion content
    },

    handleNotionSynced(data) {
      console.log("Notion synced:", data);
      // In a real app, you would refresh the lesson content
    },

    fetchCourse() {
      // Simulate API call
      setTimeout(() => {
        // Get course ID from route params
        const courseId = parseInt(this.$route.params.id);

        // In a real app, you would fetch the course from the API
        // For now, we'll use mock data
        if (this.mockCourse.id === courseId) {
          this.course = this.mockCourse;

          // Get completed lessons from localStorage
          const storedCompletedLessons = localStorage.getItem(
            `course_${courseId}_completed`
          );
          if (storedCompletedLessons) {
            this.completedLessons = JSON.parse(storedCompletedLessons);
          }

          // Set first available lesson as current
          const availableLessons = this.course.lessons.filter((lesson) =>
            this.isLessonAvailable(lesson)
          );

          if (availableLessons.length > 0) {
            this.currentLessonId = availableLessons[0].id;
          }
        }

        this.loading = false;
      }, 1000);
    },

    selectLesson(lesson) {
      if (this.isLessonAvailable(lesson)) {
        this.currentLessonId = lesson.id;

        // Mark as completed after a delay (simulating watching)
        if (!this.completedLessons.includes(lesson.id)) {
          setTimeout(() => {
            this.markLessonCompleted(lesson.id);
          }, 5000); // Mark as completed after 5 seconds (for demo purposes)
        }
      }
    },

    isLessonAvailable(lesson) {
      // Check if lesson is released (compare release date with current date)
      const now = new Date();
      return lesson.releaseDate <= now;
    },

    markLessonCompleted(lessonId) {
      if (!this.completedLessons.includes(lessonId)) {
        this.completedLessons.push(lessonId);

        // Save to localStorage
        localStorage.setItem(
          `course_${this.course.id}_completed`,
          JSON.stringify(this.completedLessons)
        );
      }
    },
  },
  computed: {
    currentLesson() {
      if (!this.course || !this.currentLessonId) return null;
      return this.course.lessons.find(
        (lesson) => lesson.id === this.currentLessonId
      );
    },
    progressPercentage() {
      if (!this.course) return 0;
      return (this.completedLessons.length / this.course.lessons.length) * 100;
    },
  },
  created() {
    this.fetchCourse();
  },
};
</script>

<style scoped>
.course-view-container {
  max-width: 100%;
}

.loading-indicator {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #666;
}

.not-found {
  text-align: center;
  padding: 3rem;
}

.btn-back {
  display: inline-block;
  background-color: #4a6bdf;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 500;
  margin-top: 1rem;
}

.course-header {
  margin-bottom: 2rem;
}

.course-header h1 {
  margin-bottom: 0.5rem;
}

.course-meta {
  display: flex;
  gap: 1.5rem;
  color: #666;
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

@media (max-width: 900px) {
  .content-layout {
    grid-template-columns: 1fr;
  }
}

.main-content {
  margin-bottom: 2rem;
}

.lesson-content {
  margin-top: 2rem;
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.lesson-content h2 {
  margin-bottom: 1rem;
  color: #333;
}

.lesson-description {
  line-height: 1.7;
  color: #444;
}

.lesson-resources {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.lesson-resources h3 {
  margin-bottom: 0.8rem;
  color: #333;
}

.lesson-resources ul {
  list-style-type: none;
  padding: 0;
}

.lesson-resources li {
  margin-bottom: 0.5rem;
}

.lesson-resources a {
  color: #4a6bdf;
  text-decoration: none;
}

.lesson-resources a:hover {
  text-decoration: underline;
}

.sidebar {
  position: sticky;
  top: 2rem;
}

.course-progress {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.progress-text {
  margin-bottom: 0.8rem;
  font-weight: 500;
}

.progress-bar-container {
  height: 8px;
  background-color: #eee;
  border-radius: 4px;
}

.progress-bar {
  height: 100%;
  background-color: #4a6bdf;
  border-radius: 4px;
  transition: width 0.3s;
}

.lessons-list {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.lessons-list h3 {
  margin-bottom: 1.2rem;
  color: #333;
}

.lesson-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.lesson-item:hover {
  background-color: #f5f7fd;
}

.lesson-item.active {
  background-color: #ebefff;
}

.lesson-item.completed {
  background-color: #f0fff0;
}

.lesson-item.locked {
  opacity: 0.7;
  cursor: not-allowed;
}

.lesson-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #4a6bdf;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 500;
  margin-right: 1rem;
}

.lesson-item.completed .lesson-number {
  background-color: #4caf50;
}

.lesson-item.locked .lesson-number {
  background-color: #9e9e9e;
}

.lesson-info {
  flex: 1;
}

.lesson-title {
  font-weight: 500;
  margin-bottom: 0.3rem;
}

.lesson-duration {
  font-size: 0.9rem;
  color: #666;
}

.lesson-status {
  margin-left: 1rem;
}
</style>
