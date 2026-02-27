import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Layout from '@/components/Layout.vue';
import Login from '@/views/Login.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/',
    component: Layout,
    redirect: '/surveys',
    children: [
      {
        path: 'surveys',
        name: 'Surveys',
        component: () => import('@/views/surveys/List.vue'),
      },
      {
        path: 'surveys/create',
        name: 'SurveyCreate',
        component: () => import('@/views/surveys/Edit.vue'),
      },
      {
        path: 'surveys/:id',
        name: 'SurveyDetail',
        component: () => import('@/views/surveys/Edit.vue'),
      },
      {
        path: 'responses/:surveyId',
        name: 'Responses',
        component: () => import('@/views/responses/List.vue'),
      },
      {
        path: 'responses/:surveyId/stats',
        name: 'ResponseStats',
        component: () => import('@/views/responses/Stats.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.path !== '/login' && !token) {
    next('/login');
  } else {
    next();
  }
});

export default router;
