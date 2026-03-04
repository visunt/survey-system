import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
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
  {
    path: '/surveys',
    name: 'SurveyList',
    component: () => import('../views/SurveyList.vue'),
  },
  {
    path: '/surveys/:id',
    name: 'SurveyDetail',
    component: () => import('../views/SurveyDetail.vue'),
  },
  {
    path: '/surveys/:id/take',
    name: 'TakeSurvey',
    component: () => import('../views/TakeSurvey.vue'),
  },
  {
    path: '/surveys/:id/results',
    name: 'SurveyResults',
    component: () => import('../views/SurveyResults.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/create-survey',
    name: 'CreateSurvey',
    component: () => import('../views/CreateSurvey.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/edit-survey/:id',
    name: 'EditSurvey',
    component: () => import('../views/EditSurvey.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;
