/**
 * Payment Service
 *
 * This service provides integration with payment gateways (primarily Stripe)
 * for processing course purchases and subscription management.
 *
 * In a production environment, these functions would make API calls to a secure backend
 * that would handle the actual communication with the payment provider.
 * Frontend should never directly communicate with payment APIs for security reasons.
 */

import api from './api';

// Mock data for demonstration purposes
const SUBSCRIPTIONS = {
  MONTHLY: {
    id: 'price_monthly',
    name: 'Monthly',
    price: 29.99,
    interval: 'month',
    features: [
      'Access to all courses',
      "New content as it's released",
      'Community forum access',
      'Cancel anytime',
    ],
  },
  ANNUAL: {
    id: 'price_annual',
    name: 'Annual',
    price: 249.99,
    interval: 'year',
    features: [
      'All features in Monthly',
      'Two months free',
      'Download videos for offline viewing',
      'Priority support',
    ],
  },
  LIFETIME: {
    id: 'price_lifetime',
    name: 'Lifetime',
    price: 599.99,
    interval: 'once',
    features: [
      'All features in Annual',
      'One-time payment',
      'Future updates forever',
      'Expert mentor sessions',
    ],
  },
};

/**
 * Get available subscription plans
 *
 * @returns {Array} List of subscription plans
 */
export function getSubscriptionPlans() {
  // In a real implementation, this would fetch from an API
  return [
    {
      id: 'monthly',
      name: 'Monthly',
      price: 19.99,
      interval: 'month',
      features: [
        'Access to all courses',
        'New courses as they launch',
        'Course completion certificates',
        'Community access',
      ],
    },
    {
      id: 'annual',
      name: 'Annual',
      price: 199.99,
      interval: 'year',
      features: [
        'All Monthly features',
        'Save 17% compared to monthly',
        'Offline viewing',
        'Priority support',
      ],
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: 599.99,
      interval: 'once',
      features: [
        'All Annual features',
        'One-time payment',
        'Lifetime access to all courses',
        'Mentor sessions (2 per month)',
      ],
    },
  ];
}

/**
 * Initialize Stripe checkout
 *
 * @param {string} priceId - Stripe price ID
 * @param {boolean} isSubscription - Whether this is a subscription or one-time purchase
 * @returns {Promise<string>} Checkout URL
 */
export async function initializeCheckout(priceId, isSubscription = true) {
  try {
    // In a real implementation, this would create a Stripe checkout session via your backend
    console.log(`Initializing checkout for price ID: ${priceId}, Subscription: ${isSubscription}`);

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // In a real implementation, this would return a URL from Stripe
    return 'https://checkout.stripe.com/mock-session';
  } catch (error) {
    console.error('Error initializing checkout:', error);
    throw new Error('Failed to initialize checkout process');
  }
}

/**
 * Purchase an individual course
 *
 * @param {number|string} courseId - ID of the course to purchase
 * @param {string} paymentMethod - Payment method ID from Stripe
 * @returns {Promise<Object>} Purchase confirmation
 */
export async function purchaseCourse(courseId, paymentMethod) {
  try {
    // In a real implementation, we would call the backend API to process the purchase
    // const response = await api.payments.purchaseCourse({
    //   courseId,
    //   paymentMethod
    // });
    // return response.data;

    // For demo purposes, we'll simulate the purchase process
    console.log(`Purchasing course ID: ${courseId} with payment method: ${paymentMethod}`);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock response
    return {
      success: true,
      transactionId: `tr_${Date.now()}`,
      courseId,
      purchaseDate: new Date().toISOString(),
      expiresAt: null, // null means lifetime access
    };
  } catch (error) {
    console.error('Error purchasing course:', error);
    throw new Error('Failed to process payment. Please try again.');
  }
}

/**
 * Get user's active subscription
 *
 * @returns {Promise<Object|null>} Active subscription or null if not subscribed
 */
export async function getActiveSubscription() {
  try {
    // In a real implementation, we would call the backend API
    // const response = await api.payments.getSubscription();
    // return response.data.subscription;

    // For demo purposes, we'll check localStorage for a mock subscription
    const subscription = localStorage.getItem('mockSubscription');

    if (subscription) {
      return JSON.parse(subscription);
    }

    return null;
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
}

/**
 * Activate a subscription (mock implementation)
 *
 * @param {string} planId - ID of the subscription plan
 * @returns {Promise<Object>} Activated subscription details
 */
export async function activateSubscription(planId) {
  try {
    // In a real implementation, this would verify the payment with your backend
    // and activate the subscription
    console.log(`Activating subscription for plan: ${planId}`);

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 600));

    const subscriptionDetails = {
      id: `sub_${Math.random().toString(36).substring(2, 10)}`,
      planId,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate:
        planId === 'lifetime'
          ? null
          : new Date(
              Date.now() + (planId === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000
            ).toISOString(),
    };

    // Store subscription in localStorage for demo purposes
    // In a real app, this would be stored on the server
    const userSubscriptions = JSON.parse(localStorage.getItem('userSubscriptions') || '[]');
    userSubscriptions.push(subscriptionDetails);
    localStorage.setItem('userSubscriptions', JSON.stringify(userSubscriptions));

    return subscriptionDetails;
  } catch (error) {
    console.error('Error activating subscription:', error);
    throw new Error('Failed to activate subscription');
  }
}

/**
 * Cancel a subscription
 *
 * @param {boolean} immediately - Whether to cancel immediately or at the end of the current period
 * @returns {Promise<Object>} Updated subscription
 */
export async function cancelSubscription(immediately = false) {
  try {
    // Get current subscription
    const subscription = await getActiveSubscription();

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    if (immediately) {
      // Cancel immediately
      localStorage.removeItem('mockSubscription');
      return { success: true, message: 'Subscription cancelled successfully' };
    } else {
      // Cancel at the end of the current period
      subscription.cancelAtPeriodEnd = true;
      localStorage.setItem('mockSubscription', JSON.stringify(subscription));
      return subscription;
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw new Error('Failed to cancel subscription. Please try again.');
  }
}

/**
 * Update payment method
 *
 * @param {string} paymentMethodId - ID of the new payment method from Stripe
 * @returns {Promise<Object>} Success response
 */
export async function updatePaymentMethod(paymentMethodId) {
  try {
    // In a real implementation, we would call the backend API
    // const response = await api.payments.updatePaymentMethod({
    //   paymentMethodId
    // });
    // return response.data;

    // For demo purposes, we'll just log the update
    console.log(`Updating payment method to: ${paymentMethodId}`);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      success: true,
      message: 'Payment method updated successfully',
    };
  } catch (error) {
    console.error('Error updating payment method:', error);
    throw new Error('Failed to update payment method. Please try again.');
  }
}

/**
 * Get the user's active subscription
 * @returns {Object|null} - The active subscription or null if none exists
 */
export function getUserSubscription() {
  try {
    // In a real implementation, this would fetch from your backend API
    const userSubscriptions = JSON.parse(localStorage.getItem('userSubscriptions') || '[]');

    // Return the most recent active subscription
    return userSubscriptions.length ? userSubscriptions[userSubscriptions.length - 1] : null;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
}

/**
 * Check if the user has access to premium content
 * @returns {boolean} - Whether the user has an active subscription
 */
export function hasActiveSubscription() {
  const subscription = getUserSubscription();

  if (!subscription) {
    return false;
  }

  // If it's a lifetime subscription and active, they have access
  if (subscription.planId === 'lifetime' && subscription.status === 'active') {
    return true;
  }

  // Check if the subscription is active and not expired
  return subscription.status === 'active' && new Date(subscription.endDate) > new Date();
}

/**
 * Generate a receipt for a subscription purchase
 * @param {string} subscriptionId - The ID of the subscription
 * @returns {Promise<Object>} - The receipt details
 */
export async function generateReceipt(subscriptionId) {
  try {
    // In a real implementation, this would fetch receipt details from your backend
    console.log(`Generating receipt for subscription: ${subscriptionId}`);

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 300));

    const userSubscriptions = JSON.parse(localStorage.getItem('userSubscriptions') || '[]');
    const subscription = userSubscriptions.find(sub => sub.id === subscriptionId);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Get plan details
    const plans = getSubscriptionPlans();
    const plan = plans.find(p => p.id === subscription.planId);

    return {
      id: `rcpt_${Math.random().toString(36).substring(2, 10)}`,
      subscriptionId,
      planName: plan.name,
      amount: plan.price,
      currency: 'USD',
      date: subscription.startDate,
      paymentMethod: 'Credit Card',
      status: 'Paid',
    };
  } catch (error) {
    console.error('Error generating receipt:', error);
    throw new Error('Failed to generate receipt');
  }
}
