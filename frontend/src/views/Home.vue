<template>
  <div class="home">
    <section class="hero">
      <div class="hero-content">
        <h1>Course Champion</h1>
        <p>A modern course management platform designed for educators</p>
        <div class="cta-buttons">
          <router-link to="/courses" class="btn btn-primary"
            >Browse Courses</router-link
          >
          <router-link to="/register" class="btn btn-secondary"
            >Sign Up</router-link
          >
        </div>
      </div>
    </section>

    <section class="features">
      <h2>Key Features</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <h3>Secure Video Hosting</h3>
          <p>
            Protect your intellectual property with our copyright-protected
            video player
          </p>
        </div>
        <div class="feature-card">
          <h3>Flexible Content Release</h3>
          <p>
            Configure "drip" content releases based on time intervals or
            specific conditions
          </p>
        </div>
        <div class="feature-card">
          <h3>Notion Integration</h3>
          <p>
            Seamlessly import and sync lecture notes from Notion, eliminating
            duplicate work
          </p>
        </div>
        <div class="feature-card">
          <h3>Subscription Payment</h3>
          <p>Flexible subscription models with multiple payment providers</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "Home",
};
</script>

<style scoped>
.home {
  max-width: 100%;
}

.hero {
  background: linear-gradient(135deg, #4a6bdf 0%, #6b8df8 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
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
  background-color: white;
  color: #4a6bdf;
}

.btn-primary:hover {
  background-color: #f0f0f0;
}

.btn-secondary {
  background-color: transparent;
  border: 2px solid white;
  color: white;
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.features {
  padding: 2rem 0;
}

.features h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.feature-card h3 {
  color: #4a6bdf;
  margin-bottom: 0.8rem;
}
</style>
