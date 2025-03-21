<template>
  <div class="subscription-plans">
    <section class="hero">
      <div class="hero-content">
        <h1>Choose Your Learning Plan</h1>
        <p>Unlock access to all courses with a subscription plan that works for you</p>
      </div>
    </section>

    <section class="plans-container">
      <div v-if="loading" class="loading-spinner">
        <div class="spinner"></div>
        <span>Loading plans...</span>
      </div>

      <div v-else-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div v-else class="pricing-plans">
        <div
          v-for="plan in subscriptionPlans"
          :key="plan.id"
          class="pricing-plan"
          :class="{ featured: plan.name === 'Annual' }"
        >
          <div v-if="plan.name === 'Annual'" class="most-popular">Most Popular</div>
          <h2>{{ plan.name }}</h2>
          <div class="plan-price">
            <span class="amount">${{ plan.price }}</span>
            <span class="interval" v-if="plan.interval !== 'once'">/ {{ plan.interval }}</span>
          </div>
          <ul class="plan-features">
            <li v-for="(feature, index) in plan.features" :key="index">
              <span class="feature-check">✓</span> {{ feature }}
            </li>
          </ul>
          <button @click="selectPlan(plan)" class="subscribe-button" :disabled="isProcessing">
            {{ isProcessing && selectedPlan?.id === plan.id ? 'Processing...' : 'Subscribe Now' }}
          </button>
        </div>
      </div>

      <div class="satisfaction-guarantee">
        <p>30-day money-back guarantee. No questions asked.</p>
      </div>
    </section>

    <section class="plan-comparison">
      <h2>Plan Comparison</h2>
      <div class="comparison-table">
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th v-for="plan in subscriptionPlans" :key="plan.id">{{ plan.name }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>All Courses</td>
              <td v-for="plan in subscriptionPlans" :key="`${plan.id}-courses`">✓</td>
            </tr>
            <tr>
              <td>New Courses</td>
              <td v-for="plan in subscriptionPlans" :key="`${plan.id}-new`">✓</td>
            </tr>
            <tr>
              <td>Offline Viewing</td>
              <td>❌</td>
              <td>✓</td>
              <td>✓</td>
            </tr>
            <tr>
              <td>Priority Support</td>
              <td>❌</td>
              <td>✓</td>
              <td>✓</td>
            </tr>
            <tr>
              <td>Mentor Sessions</td>
              <td>❌</td>
              <td>❌</td>
              <td>✓</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="faq">
      <h2>Frequently Asked Questions</h2>
      <div class="faq-items">
        <div class="faq-item">
          <h3>Can I cancel at any time?</h3>
          <p>
            Yes, you can cancel your subscription at any time. Monthly and annual plans will remain
            active until the end of the current billing period.
          </p>
        </div>
        <div class="faq-item">
          <h3>Are there any refunds?</h3>
          <p>
            We offer a 30-day money-back guarantee for all subscription plans. If you're not
            satisfied, contact us within 30 days for a full refund.
          </p>
        </div>
        <div class="faq-item">
          <h3>How do I access courses?</h3>
          <p>
            Once you've subscribed, you'll have immediate access to all courses on the platform.
            Simply navigate to the Courses page and start learning!
          </p>
        </div>
        <div class="faq-item">
          <h3>Can I switch plans?</h3>
          <p>
            Yes, you can upgrade or downgrade your plan at any time. If you upgrade, you'll be
            charged the prorated difference. If you downgrade, the new rate will apply at the next
            billing cycle.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import {
  getSubscriptionPlans,
  initializeCheckout,
  activateSubscription,
} from '../services/paymentService';

export default {
  name: 'SubscriptionPlans',
  data() {
    return {
      subscriptionPlans: [],
      loading: true,
      errorMessage: '',
      isProcessing: false,
      selectedPlan: null,
    };
  },
  methods: {
    async loadPlans() {
      try {
        this.loading = true;
        this.errorMessage = '';

        // Get subscription plans
        this.subscriptionPlans = getSubscriptionPlans();

        this.loading = false;
      } catch (error) {
        console.error('Error loading subscription plans:', error);
        this.errorMessage = 'Failed to load subscription plans. Please try again.';
        this.loading = false;
      }
    },
    async selectPlan(plan) {
      try {
        if (!this.isAuthenticated()) {
          // Redirect to login if not authenticated
          this.$router.push({
            path: '/login',
            query: { redirect: '/subscription-plans' },
          });
          return;
        }

        this.isProcessing = true;
        this.selectedPlan = plan;

        // In a real implementation, this would redirect to Stripe checkout
        const checkoutUrl = await initializeCheckout(plan.id, plan.interval !== 'once');

        // For demonstration purposes, we'll just activate the subscription directly
        // In a real application, this would happen after Stripe redirects back to the site
        const subscription = await activateSubscription(plan.id);

        // Redirect to dashboard or confirmation page
        this.$router.push({
          path: '/subscription-success',
          query: { plan: plan.name },
        });
      } catch (error) {
        console.error('Error selecting plan:', error);
        alert('Failed to process subscription. Please try again.');
      } finally {
        this.isProcessing = false;
        this.selectedPlan = null;
      }
    },
    isAuthenticated() {
      return localStorage.getItem('token') !== null;
    },
  },
  mounted() {
    this.loadPlans();
  },
};
</script>

<style scoped>
.subscription-plans {
  max-width: 100%;
}

.hero {
  background: linear-gradient(135deg, #4a6bdf 0%, #6b8df8 100%);
  color: white;
  padding: 3rem 2rem;
  text-align: center;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.hero-content h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto;
}

.plans-container {
  padding: 2rem 0;
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

.error-message {
  text-align: center;
  color: #e74c3c;
  padding: 2rem;
}

.pricing-plans {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.pricing-plan {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.pricing-plan:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}

.pricing-plan.featured {
  border: 2px solid #4a6bdf;
  transform: scale(1.05);
}

.pricing-plan.featured:hover {
  transform: translateY(-5px) scale(1.05);
}

.most-popular {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #4a6bdf;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.pricing-plan h2 {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.plan-price {
  text-align: center;
  margin-bottom: 2rem;
}

.amount {
  font-size: 3rem;
  font-weight: 700;
  color: #4a6bdf;
}

.interval {
  font-size: 1.2rem;
  color: #666;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
  flex-grow: 1;
}

.plan-features li {
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
}

.feature-check {
  color: #4a6bdf;
  font-weight: bold;
  margin-right: 0.5rem;
}

.subscribe-button {
  background-color: #4a6bdf;
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
}

.subscribe-button:hover {
  background-color: #3a5bc5;
}

.subscribe-button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.satisfaction-guarantee {
  text-align: center;
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.plan-comparison {
  margin-top: 4rem;
  margin-bottom: 4rem;
}

.plan-comparison h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  color: #333;
}

.comparison-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

th,
td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f7f9fc;
  font-weight: 600;
  color: #333;
}

tbody tr:nth-child(even) {
  background-color: #f7f9fc;
}

tbody tr:hover {
  background-color: #f0f3f9;
}

tbody td:first-child {
  text-align: left;
  font-weight: 500;
}

.faq {
  margin-top: 4rem;
}

.faq h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  color: #333;
}

.faq-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.faq-item {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.faq-item h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #4a6bdf;
  font-size: 1.2rem;
}

.faq-item p {
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .pricing-plans {
    flex-direction: column;
    align-items: center;
  }

  .pricing-plan {
    max-width: 100%;
  }

  .pricing-plan.featured {
    transform: none;
  }

  .pricing-plan.featured:hover {
    transform: translateY(-5px);
  }

  .faq-items {
    grid-template-columns: 1fr;
  }
}
</style>
