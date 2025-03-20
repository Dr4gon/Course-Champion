<template>
  <div class="courses-container">
    <section class="courses-header">
      <h1>Browse Courses</h1>
      <p>
        Discover our premium educational content tailored for modern learning
      </p>
    </section>

    <section class="filter-section">
      <div class="search-container">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search courses..."
          class="search-input"
        />
      </div>
      <div class="filters">
        <select v-model="categoryFilter" class="filter-select">
          <option value="">All Categories</option>
          <option value="programming">Programming</option>
          <option value="design">Design</option>
          <option value="business">Business</option>
          <option value="marketing">Marketing</option>
        </select>
      </div>
    </section>

    <section class="courses-grid">
      <div v-if="loading" class="loading-indicator">Loading courses...</div>

      <div v-else-if="filteredCourses.length === 0" class="no-courses">
        No courses found. Try adjusting your filters.
      </div>

      <div v-else class="course-cards">
        <div
          v-for="course in filteredCourses"
          :key="course.id"
          class="course-card"
        >
          <div class="course-thumbnail">
            <img :src="course.thumbnail" :alt="course.title" />
          </div>
          <div class="course-info">
            <h3>{{ course.title }}</h3>
            <p class="course-instructor">{{ course.instructor }}</p>
            <p class="course-description">{{ course.description }}</p>
            <div class="course-meta">
              <span class="course-duration">{{ course.duration }}</span>
              <span class="course-level">{{ course.level }}</span>
            </div>
            <div class="course-price">{{ course.price }}</div>
            <button class="btn-enroll">View Course</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "Courses",
  data() {
    return {
      searchQuery: "",
      categoryFilter: "",
      loading: true,
      courses: [
        {
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
        },
        {
          id: 2,
          title: "UI/UX Design Principles",
          instructor: "Sarah Johnson",
          description:
            "Master the art of creating beautiful and functional user interfaces.",
          duration: "6 weeks",
          level: "Intermediate",
          category: "design",
          price: "$59.99",
          thumbnail: "https://via.placeholder.com/300x200?text=UI/UX+Design",
        },
        {
          id: 3,
          title: "Digital Marketing Fundamentals",
          instructor: "Michael Brown",
          description:
            "Learn how to create effective digital marketing campaigns.",
          duration: "4 weeks",
          level: "Beginner",
          category: "marketing",
          price: "$39.99",
          thumbnail:
            "https://via.placeholder.com/300x200?text=Digital+Marketing",
        },
        {
          id: 4,
          title: "Business Analytics",
          instructor: "Emma Williams",
          description:
            "Learn how to analyze business data to make informed decisions.",
          duration: "10 weeks",
          level: "Advanced",
          category: "business",
          price: "$79.99",
          thumbnail:
            "https://via.placeholder.com/300x200?text=Business+Analytics",
        },
      ],
    };
  },
  computed: {
    filteredCourses() {
      let result = this.courses;

      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(
          (course) =>
            course.title.toLowerCase().includes(query) ||
            course.description.toLowerCase().includes(query)
        );
      }

      // Apply category filter
      if (this.categoryFilter) {
        result = result.filter(
          (course) => course.category === this.categoryFilter
        );
      }

      return result;
    },
  },
  mounted() {
    // Simulate API loading
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  },
};
</script>

<style scoped>
.courses-container {
  max-width: 100%;
}

.courses-header {
  text-align: center;
  margin-bottom: 2rem;
}

.courses-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.courses-header p {
  color: #666;
  font-size: 1.1rem;
}

.filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.search-container {
  flex: 2;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.filters {
  flex: 1;
  min-width: 200px;
}

.filter-select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  background-color: white;
}

.loading-indicator,
.no-courses {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #666;
}

.course-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.course-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.course-thumbnail img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.course-info {
  padding: 1.5rem;
}

.course-info h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.course-instructor {
  color: #4a6bdf;
  font-weight: 500;
  margin-bottom: 0.8rem;
}

.course-description {
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #777;
}

.course-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1.2rem;
}

.btn-enroll {
  width: 100%;
  background-color: #4a6bdf;
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 5px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-enroll:hover {
  background-color: #3a5bc5;
}
</style>
