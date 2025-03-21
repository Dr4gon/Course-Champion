<template>
  <div class="billing-management">
    <div class="page-header">
      <h1>Billing & Subscription</h1>
      <p>Manage your subscription and payment methods</p>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <span>Loading subscription information...</span>
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else class="billing-content">
      <section class="subscription-section">
        <h2>Current Subscription</h2>

        <div v-if="!subscription" class="no-subscription">
          <p>You don't have an active subscription.</p>
          <router-link to="/subscription-plans" class="action-button primary">
            View Subscription Plans
          </router-link>
        </div>

        <div v-else class="subscription-details">
          <div class="subscription-card">
            <div class="subscription-header">
              <div>
                <h3>{{ getPlanName(subscription.planId) }}</h3>
                <span class="status-badge" :class="subscription.status">
                  {{ formatStatus(subscription.status) }}
                </span>
              </div>
              <div
                v-if="subscription.status === 'active' && subscription.planId !== 'lifetime'"
                class="subscription-price"
              >
                ${{ formatPrice(getPlanPrice(subscription.planId)) }}/{{
                  getPlanInterval(subscription.planId)
                }}
              </div>
              <div v-else-if="subscription.planId === 'lifetime'" class="subscription-price">
                One-time payment
              </div>
            </div>

            <div class="subscription-body">
              <div class="detail-row">
                <span class="detail-label">Started on</span>
                <span class="detail-value">{{ formatDate(subscription.startDate) }}</span>
              </div>

              <div
                v-if="subscription.planId !== 'lifetime' && subscription.endDate"
                class="detail-row"
              >
                <span class="detail-label">Next billing date</span>
                <span class="detail-value">{{ formatDate(subscription.endDate) }}</span>
              </div>

              <div v-if="subscription.planId === 'lifetime'" class="detail-row">
                <span class="detail-label">Access</span>
                <span class="detail-value">Lifetime</span>
              </div>

              <div v-if="subscription.cancelledAt" class="detail-row">
                <span class="detail-label">Cancelled on</span>
                <span class="detail-value">{{ formatDate(subscription.cancelledAt) }}</span>
              </div>
            </div>

            <div class="subscription-actions">
              <button
                v-if="subscription.status === 'active' && subscription.planId !== 'lifetime'"
                @click="confirmCancelSubscription"
                class="action-button danger"
              >
                Cancel Subscription
              </button>

              <button
                v-if="subscription.status !== 'active' || subscription.planId === 'lifetime'"
                @click="goToSubscriptionPlans"
                class="action-button primary"
              >
                Change Plan
              </button>
            </div>
          </div>
        </div>
      </section>

      <section v-if="subscription && subscription.status === 'active'" class="payment-section">
        <h2>Payment Method</h2>
        <div class="payment-method-card">
          <!-- In a real app, this would show actual payment method details -->
          <div class="payment-method-details">
            <div class="card-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
            </div>
            <div class="card-details">
              <span class="card-brand">Visa</span>
              <span class="card-number">•••• •••• •••• 1234</span>
              <span class="card-expiry">Expires 12/2025</span>
            </div>
          </div>
          <div class="payment-method-actions">
            <button class="action-button secondary">Update Payment Method</button>
          </div>
        </div>
      </section>

      <section class="billing-history-section">
        <h2>Billing History</h2>

        <div v-if="invoices.length === 0" class="no-invoices">
          <p>No invoices found.</p>
        </div>

        <div v-else class="invoices-list">
          <div class="invoice-table-header">
            <span>Date</span>
            <span>Description</span>
            <span>Amount</span>
            <span>Status</span>
            <span></span>
          </div>

          <div v-for="invoice in invoices" :key="invoice.id" class="invoice-row">
            <span>{{ formatDate(invoice.date) }}</span>
            <span>{{ invoice.planName }} Subscription</span>
            <span>${{ formatPrice(invoice.amount) }}</span>
            <span>
              <span class="status-badge paid">{{ invoice.status }}</span>
            </span>
            <span>
              <button @click="downloadInvoice(invoice.id)" class="text-button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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
                Download
              </button>
            </span>
          </div>
        </div>
      </section>
    </div>

    <!-- Cancellation Confirmation Modal -->
    <div v-if="showCancelModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Cancel Subscription</h3>
        <p>
          Are you sure you want to cancel your {{ getPlanName(subscription?.planId) }} subscription?
        </p>
        <p class="modal-note">
          Your subscription will remain active until the end of the current billing period.
        </p>
        <div class="modal-actions">
          <button @click="showCancelModal = false" class="action-button secondary">
            Keep Subscription
          </button>
          <button @click="cancelSubscription" class="action-button danger">Yes, Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getUserSubscription,
  cancelSubscription,
  getSubscriptionPlans,
  generateReceipt,
} from '../services/paymentService';

export default {
  name: 'BillingManagement',
  data() {
    return {
      subscription: null,
      invoices: [],
      loading: true,
      error: null,
      showCancelModal: false,
      plans: [],
    };
  },
  methods: {
    formatPrice(price) {
      return Number(price).toFixed(2);
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    },
    formatStatus(status) {
      return status.charAt(0).toUpperCase() + status.slice(1);
    },
    getPlanName(planId) {
      const plan = this.plans.find(p => p.id === planId);
      return plan ? plan.name : 'Unknown Plan';
    },
    getPlanPrice(planId) {
      const plan = this.plans.find(p => p.id === planId);
      return plan ? plan.price : 0;
    },
    getPlanInterval(planId) {
      const plan = this.plans.find(p => p.id === planId);
      return plan ? plan.interval : 'month';
    },
    async loadSubscriptionData() {
      try {
        this.loading = true;
        this.error = null;

        // Load available subscription plans
        this.plans = getSubscriptionPlans();

        // Get user's subscription
        this.subscription = getUserSubscription();

        // If there's an active subscription, generate a receipt for the billing history
        if (this.subscription && this.subscription.status === 'active') {
          const receipt = await generateReceipt(this.subscription.id);
          this.invoices = [receipt];
        } else {
          this.invoices = [];
        }

        this.loading = false;
      } catch (error) {
        console.error('Error loading subscription data:', error);
        this.error = 'Failed to load subscription data. Please try again later.';
        this.loading = false;
      }
    },
    confirmCancelSubscription() {
      this.showCancelModal = true;
    },
    async cancelSubscription() {
      try {
        if (!this.subscription) return;

        await cancelSubscription(this.subscription.id);

        // Reload subscription data
        this.loadSubscriptionData();

        // Close modal
        this.showCancelModal = false;

        // Success message
        alert(
          'Your subscription has been cancelled successfully. You will continue to have access until the end of your current billing period.'
        );
      } catch (error) {
        console.error('Error cancelling subscription:', error);
        alert('Failed to cancel subscription. Please try again later.');
      }
    },
    goToSubscriptionPlans() {
      this.$router.push('/subscription-plans');
    },
    async downloadInvoice(invoiceId) {
      try {
        // In a real app, this would generate and download a PDF invoice
        alert(`Invoice ${invoiceId} has been downloaded.`);
      } catch (error) {
        console.error('Error downloading invoice:', error);
        alert('Failed to download invoice. Please try again later.');
      }
    },
  },
  mounted() {
    this.loadSubscriptionData();
  },
};
</script>

<style scoped>
.billing-management {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.page-header p {
  color: #666;
  font-size: 1.1rem;
}

.loading-container {
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
  background-color: #fee;
  color: #e44;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 2rem;
}

section {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  margin-bottom: 2rem;
}

section h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.no-subscription p {
  margin-bottom: 1.5rem;
  color: #666;
}

.subscription-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.subscription-header {
  background-color: #f8f9fa;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.subscription-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  color: #333;
}

.subscription-price {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.subscription-body {
  padding: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.detail-row:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.detail-label {
  color: #666;
}

.detail-value {
  font-weight: 500;
  color: #333;
}

.subscription-actions {
  padding: 1.5rem;
  background-color: #f8f9fa;
  display: flex;
  justify-content: flex-end;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: #e6f7ee;
  color: #2ecc71;
}

.status-badge.cancelled {
  background-color: #fee;
  color: #e74c3c;
}

.status-badge.paid {
  background-color: #e6f7ee;
  color: #2ecc71;
}

.payment-method-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 8px;
}

.payment-method-details {
  display: flex;
  align-items: center;
}

.card-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: #4a6bdf;
}

.card-details {
  display: flex;
  flex-direction: column;
}

.card-brand {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.card-number {
  color: #666;
  margin-bottom: 0.25rem;
}

.card-expiry {
  font-size: 0.9rem;
  color: #666;
}

.invoice-table-header {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr 0.5fr;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px 8px 0 0;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #eee;
}

.invoice-row {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr 0.5fr;
  padding: 1rem;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.invoice-row:last-child {
  border-bottom: none;
}

.no-invoices {
  padding: 1rem;
  color: #666;
}

.action-button {
  padding: 0.75rem 1.25rem;
  border-radius: 5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.action-button.primary {
  background-color: #4a6bdf;
  color: white;
}

.action-button.primary:hover {
  background-color: #3a5bc5;
}

.action-button.secondary {
  background-color: #f1f3f5;
  color: #333;
}

.action-button.secondary:hover {
  background-color: #e9ecef;
}

.action-button.danger {
  background-color: white;
  color: #e74c3c;
  border: 1px solid #e74c3c;
}

.action-button.danger:hover {
  background-color: #fee;
}

.text-button {
  background: none;
  border: none;
  padding: 0.5rem;
  color: #4a6bdf;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
}

.text-button:hover {
  text-decoration: underline;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
}

.modal-content h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.modal-content p {
  margin-bottom: 1.5rem;
  color: #666;
}

.modal-note {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1.5rem;
  color: #666;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

@media (max-width: 768px) {
  section {
    padding: 1.5rem;
  }

  .subscription-header,
  .payment-method-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .subscription-price,
  .payment-method-actions {
    margin-top: 1rem;
  }

  .invoice-table-header,
  .invoice-row {
    grid-template-columns: 1fr 1fr 1fr;
  }

  .invoice-table-header span:nth-child(4),
  .invoice-table-header span:nth-child(5),
  .invoice-row span:nth-child(4),
  .invoice-row span:nth-child(5) {
    display: none;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
