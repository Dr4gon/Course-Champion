<template>
  <div class="dashboard">
    <section class="dashboard-header">
      <div class="user-welcome">
        <h1>Welcome back, {{ userName }}</h1>
        <p>Track your progress and continue learning</p>
      </div>
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-value">{{ enrolledCourses.length }}</div>
          <div class="stat-label">Enrolled Courses</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ completedCourses }}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ averageProgress }}%</div>
          <div class="stat-label">Average Progress</div>
        </div>
      </div>
    </section>

    <section class="dashboard-content">
      <div class="section-header">
        <h2>Your Courses</h2>
        <router-link to="/courses" class="browse-more-link"> Browse More Courses </router-link>
      </div>

      <div v-if="loading" class="loading-spinner">
        <div class="spinner"></div>
        <span>Loading your courses...</span>
      </div>

      <div v-else-if="enrolledCourses.length === 0" class="no-courses">
        <p>You haven't enrolled in any courses yet.</p>
        <router-link to="/courses" class="btn btn-primary"> Explore Courses </router-link>
      </div>

      <div v-else class="enrolled-courses">
        <div v-for="course in enrolledCourses" :key="course.id" class="course-progress-card">
          <div class="course-image">
            <img :src="course.thumbnail" :alt="course.title" />
            <div class="progress-overlay">
              <div class="progress-circle">
                <svg width="70" height="70" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e6e6e6" stroke-width="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#4a6bdf"
                    stroke-width="8"
                    stroke-dasharray="283"
                    :stroke-dashoffset="283 - (283 * course.progress) / 100"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <span class="progress-text">{{ course.progress }}%</span>
              </div>
            </div>
          </div>
          <div class="course-info">
            <h3>{{ course.title }}</h3>
            <p class="course-instructor">{{ course.instructor }}</p>
            <div class="last-activity" v-if="course.lastAccessed">
              <span>Last activity: {{ formatDate(course.lastAccessed) }}</span>
            </div>
            <div class="course-actions">
              <router-link :to="`/courses/${course.id}`" class="btn-continue">
                {{ course.progress > 0 ? 'Continue' : 'Start' }}
              </router-link>
              <button @click="unenrollCourse(course.id)" class="btn-unenroll">Unenroll</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="dashboard-content" v-if="recentLessons.length > 0">
      <div class="section-header">
        <h2>Continue Learning</h2>
      </div>
      <div class="recent-lessons">
        <div v-for="lesson in recentLessons" :key="lesson.id" class="recent-lesson-card">
          <div class="lesson-info">
            <div class="course-title">{{ lesson.courseName }}</div>
            <h4>{{ lesson.title }}</h4>
            <div class="lesson-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${lesson.progress}%` }"></div>
              </div>
              <span class="progress-text">{{ lesson.progress }}% complete</span>
            </div>
          </div>
          <div class="lesson-actions">
            <router-link :to="`/courses/${lesson.courseId}?lesson=${lesson.id}`" class="btn-resume">
              Resume
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <section class="dashboard-content" v-if="recommendations.length > 0">
      <div class="section-header">
        <h2>Recommended for You</h2>
      </div>
      <div class="course-recommendations">
        <div v-for="course in recommendations" :key="course.id" class="recommended-course">
          <img :src="course.thumbnail" :alt="course.title" />
          <h4>{{ course.title }}</h4>
          <p>{{ course.description }}</p>
          <router-link :to="`/courses/${course.id}`" class="btn-view"> View Course </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { calculateCourseProgress } from '../services/progressService';

export default {
  name: 'Dashboard',
  data() {
    return {
      loading: true,
      userName: 'Student',
      enrolledCourses: [],
      recentLessons: [],
      recommendations: [],
    };
  },
  computed: {
    completedCourses() {
      return this.enrolledCourses.filter(course => course.progress === 100).length;
    },
    averageProgress() {
      if (this.enrolledCourses.length === 0) return 0;
      const total = this.enrolledCourses.reduce((sum, course) => sum + course.progress, 0);
      return Math.round(total / this.enrolledCourses.length);
    },
  },
  methods: {
    async fetchUserData() {
      try {
        // In a real application, this would come from an API
        // For now, we're using mock data
        this.loading = true;

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get user info
        this.userName = 'Alex Johnson';

        // Get enrolled courses with progress
        this.enrolledCourses = [
          {
            id: 1,
            title: 'Introduction to Web Development',
            instructor: 'John Smith',
            thumbnail: 'https://via.placeholder.com/300x200?text=Web+Development',
            progress: 75,
            lastAccessed: new Date(Date.now() - 86400000), // 1 day ago
          },
          {
            id: 2,
            title: 'UI/UX Design Principles',
            instructor: 'Sarah Johnson',
            thumbnail: 'https://via.placeholder.com/300x200?text=UI/UX+Design',
            progress: 32,
            lastAccessed: new Date(Date.now() - 259200000), // 3 days ago
          },
          {
            id: 4,
            title: 'Business Analytics',
            instructor: 'Emma Williams',
            thumbnail: 'https://via.placeholder.com/300x200?text=Business+Analytics',
            progress: 100,
            lastAccessed: new Date(Date.now() - 604800000), // 7 days ago
          },
        ];

        // Get recent lessons
        this.recentLessons = [
          {
            id: 3,
            courseId: 1,
            courseName: 'Introduction to Web Development',
            title: 'Building Your First Website',
            progress: 45,
            lastAccessed: new Date(Date.now() - 86400000), // 1 day ago
          },
          {
            id: 5,
            courseId: 2,
            courseName: 'UI/UX Design Principles',
            title: 'User Research Methods',
            progress: 20,
            lastAccessed: new Date(Date.now() - 172800000), // 2 days ago
          },
        ];

        // Get course recommendations
        this.recommendations = [
          {
            id: 3,
            title: 'Digital Marketing Fundamentals',
            description:
              'Learn how to create effective digital marketing campaigns and grow your online presence.',
            thumbnail: 'https://via.placeholder.com/300x200?text=Digital+Marketing',
          },
          {
            id: 5,
            title: 'Advanced JavaScript',
            description:
              'Take your JavaScript skills to the next level with modern patterns and techniques.',
            thumbnail: 'https://via.placeholder.com/300x200?text=Advanced+JavaScript',
          },
        ];

        this.loading = false;
      } catch (error) {
        console.error('Error fetching user data:', error);
        this.loading = false;
      }
    },
    formatDate(date) {
      // Format date to "X days ago" or actual date if older
      const now = new Date();
      const diff = Math.floor((now - new Date(date)) / (1000 * 60 * 60 * 24));

      if (diff === 0) return 'Today';
      if (diff === 1) return 'Yesterday';
      if (diff < 7) return `${diff} days ago`;

      return new Date(date).toLocaleDateString();
    },
    async unenrollCourse(courseId) {
      if (confirm('Are you sure you want to unenroll from this course?')) {
        // In a real app, we would call an API to unenroll
        // For now, just remove from our local array
        this.enrolledCourses = this.enrolledCourses.filter(course => course.id !== courseId);
      }
    },
  },
  mounted() {
    this.fetchUserData();
  },
};
</script>

<style scoped>
.dashboard {
  max-width: 100%;
}

.dashboard-header {
  background-color: white;
  border-radius: 10px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.user-welcome h1 {
  margin-bottom: 0.5rem;
  color: #333;
}

.user-welcome p {
  color: #666;
  margin-bottom: 1.5rem;
}

.stats-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.stat-card {
  flex: 1;
  min-width: 140px;
  background-color: #f7f9fc;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid #4a6bdf;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #4a6bdf;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: #666;
}

.dashboard-content {
  background-color: white;
  border-radius: 10px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  color: #333;
}

.browse-more-link {
  color: #4a6bdf;
  text-decoration: none;
}

.browse-more-link:hover {
  text-decoration: underline;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4a6bdf;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.no-courses {
  text-align: center;
  padding: 3rem;
}

.no-courses p {
  margin-bottom: 1.5rem;
  color: #666;
}

.btn {
  display: inline-block;
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #4a6bdf;
  color: white;
}

.btn-primary:hover {
  background-color: #3a5bc5;
}

.enrolled-courses {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.course-progress-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s;
  background-color: white;
}

.course-progress-card:hover {
  transform: translateY(-5px);
}

.course-image {
  height: 150px;
  position: relative;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.progress-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
}

.progress-circle {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.progress-text {
  position: absolute;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a6bdf;
}

.course-info {
  padding: 1.2rem;
}

.course-info h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.course-instructor {
  color: #4a6bdf;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.last-activity {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 1rem;
}

.course-actions {
  display: flex;
  justify-content: space-between;
}

.btn-continue {
  display: inline-block;
  padding: 0.6rem 1.2rem;
  background-color: #4a6bdf;
  color: white;
  border-radius: 5px;
  font-weight: 500;
  text-decoration: none;
}

.btn-unenroll {
  padding: 0.6rem 1.2rem;
  border: 1px solid #ddd;
  background: none;
  border-radius: 5px;
  cursor: pointer;
  color: #666;
}

.btn-unenroll:hover {
  background-color: #f5f5f5;
}

.recent-lessons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recent-lesson-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem;
  background-color: #f7f9fc;
  border-radius: 8px;
  border-left: 4px solid #4a6bdf;
}

.lesson-info {
  flex: 1;
}

.course-title {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.3rem;
}

.lesson-info h4 {
  margin-top: 0;
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
}

.lesson-progress {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: #e6e6e6;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4a6bdf;
}

.lesson-progress .progress-text {
  font-size: 0.85rem;
  color: #666;
  position: static;
  min-width: 90px;
}

.btn-resume {
  padding: 0.6rem 1.2rem;
  background-color: #4a6bdf;
  color: white;
  border-radius: 5px;
  font-weight: 500;
  text-decoration: none;
}

.course-recommendations {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.recommended-course {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s;
}

.recommended-course:hover {
  transform: translateY(-5px);
}

.recommended-course img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.recommended-course h4 {
  padding: 0 1rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.recommended-course p {
  padding: 0 1rem;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
}

.btn-view {
  display: block;
  margin: 0 1rem 1rem;
  padding: 0.6rem 0;
  background-color: #f7f9fc;
  color: #4a6bdf;
  border-radius: 5px;
  font-weight: 500;
  text-decoration: none;
  text-align: center;
}

.btn-view:hover {
  background-color: #e6ebf5;
}

@media (max-width: 768px) {
  .enrolled-courses,
  .course-recommendations {
    grid-template-columns: 1fr;
  }

  .recent-lesson-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .lesson-actions {
    margin-top: 1rem;
    align-self: flex-end;
  }
}
</style>
