<template>
  <div class="subscription-success">
    <div class="success-card">
      <div class="success-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>

      <h1>Thank You for Subscribing!</h1>
      <p class="message">Your {{ planName }} subscription is now active.</p>

      <div class="subscription-details">
        <div class="detail-item">
          <span class="label">Subscription Type:</span>
          <span class="value">{{ planName }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Amount:</span>
          <span class="value">${{ subscription ? formatPrice(subscription.amount) : '--' }}</span>
        </div>
        <div class="detail-item" v-if="subscription && subscription.startDate">
          <span class="label">Start Date:</span>
          <span class="value">{{ formatDate(subscription.startDate) }}</span>
        </div>
        <div
          class="detail-item"
          v-if="planId !== 'lifetime' && subscription && subscription.endDate"
        >
          <span class="label">Next Billing Date:</span>
          <span class="value">{{ formatDate(subscription.endDate) }}</span>
        </div>
        <div class="detail-item" v-if="planId === 'lifetime'">
          <span class="label">Access:</span>
          <span class="value">Lifetime</span>
        </div>
      </div>

      <div class="receipt-section">
        <button @click="downloadReceipt" class="receipt-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download Receipt
        </button>
      </div>

      <div class="action-buttons">
        <router-link to="/dashboard" class="dashboard-button">Go to Dashboard</router-link>
        <router-link to="/courses" class="courses-button">Browse Courses</router-link>
      </div>
    </div>

    <section class="next-steps">
      <h2>What's Next?</h2>
      <div class="steps-grid">
        <div class="step-item">
          <div class="step-number">1</div>
          <h3>Complete Your Profile</h3>
          <p>
            Enhance your learning experience by completing your profile with your interests and
            goals.
          </p>
          <router-link to="/profile" class="step-link">Update Profile</router-link>
        </div>
        <div class="step-item">
          <div class="step-number">2</div>
          <h3>Start Learning</h3>
          <p>Explore our course catalog and start your learning journey right away.</p>
          <router-link to="/courses" class="step-link">Explore Courses</router-link>
        </div>
        <div class="step-item">
          <div class="step-number">3</div>
          <h3>Join the Community</h3>
          <p>Connect with fellow learners and instructors in our thriving learning community.</p>
          <router-link to="/community" class="step-link">Join Now</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { getUserSubscription, generateReceipt } from '../services/paymentService';

export default {
  name: 'SubscriptionSuccess',
  data() {
    return {
      subscription: null,
      planId: '',
      planName: '',
      isLoading: false,
    };
  },
  methods: {
    formatPrice(price) {
      return Number(price).toFixed(2);
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    },
    async getSubscriptionDetails() {
      try {
        this.isLoading = true;

        // Get the user's most recent subscription
        const subscription = getUserSubscription();

        if (subscription) {
          this.subscription = subscription;
          this.planId = subscription.planId;

          // Set plan name based on plan ID
          switch (subscription.planId) {
            case 'monthly':
              this.planName = 'Monthly';
              break;
            case 'annual':
              this.planName = 'Annual';
              break;
            case 'lifetime':
              this.planName = 'Lifetime';
              break;
            default:
              this.planName = 'Subscription';
          }
        } else {
          // Fallback to the query parameter if no subscription is found
          this.planName = this.$route.query.plan || 'Subscription';
        }
      } catch (error) {
        console.error('Error getting subscription details:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async downloadReceipt() {
      try {
        if (!this.subscription) {
          alert('No subscription found to generate receipt');
          return;
        }

        // In a real application, this would generate a PDF receipt
        // For this demo, we'll just mock the behavior

        await generateReceipt(this.subscription.id);

        // Simulate download delay
        setTimeout(() => {
          alert('Receipt downloaded successfully!');
        }, 1000);
      } catch (error) {
        console.error('Error downloading receipt:', error);
        alert('Failed to download receipt. Please try again later.');
      }
    },
  },
  mounted() {
    this.getSubscriptionDetails();
  },
};
</script>

<style scoped>
.subscription-success {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.success-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 3rem 2rem;
  text-align: center;
  margin-bottom: 3rem;
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 2rem;
  background-color: #4caf50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon svg {
  width: 40px;
  height: 40px;
  color: white;
}

h1 {
  color: #333;
  font-size: 2rem;
  margin-bottom: 1rem;
}

.message {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.subscription-details {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #eee;
}

.detail-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #555;
}

.value {
  font-weight: 600;
  color: #333;
}

.receipt-section {
  margin-bottom: 2rem;
}

.receipt-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0 auto;
}

.receipt-button:hover {
  background-color: #e9ecef;
}

.receipt-button svg {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.dashboard-button,
.courses-button {
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.dashboard-button {
  background-color: #4a6bdf;
  color: white;
}

.dashboard-button:hover {
  background-color: #3a5bc5;
}

.courses-button {
  background-color: white;
  color: #4a6bdf;
  border: 1px solid #4a6bdf;
}

.courses-button:hover {
  background-color: #f0f3fa;
}

.next-steps {
  margin-top: 3rem;
}

.next-steps h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  color: #333;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.step-item {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  position: relative;
}

.step-number {
  position: absolute;
  top: -15px;
  left: 20px;
  width: 30px;
  height: 30px;
  background-color: #4a6bdf;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.step-item h3 {
  color: #333;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}

.step-item p {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.step-link {
  color: #4a6bdf;
  text-decoration: none;
  font-weight: 500;
  display: inline-block;
}

.step-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 1rem;
  }

  .dashboard-button,
  .courses-button {
    width: 100%;
    text-align: center;
  }
}
</style>
