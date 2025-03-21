import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/courses',
    name: 'Courses',
    component: () => import('../views/Courses.vue'),
  },
  {
    path: '/courses/:id',
    name: 'CourseView',
    component: () => import('../views/CourseView.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
  },
  // Subscription routes
  {
    path: '/subscription-plans',
    name: 'SubscriptionPlans',
    component: () => import('../views/SubscriptionPlans.vue'),
  },
  {
    path: '/subscription-success',
    name: 'SubscriptionSuccess',
    component: () => import('../views/SubscriptionSuccess.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/account/billing',
    name: 'BillingManagement',
    component: () => import('../views/BillingManagement.vue'),
    meta: { requiresAuth: true },
  },
  // Catch all route for 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;
