import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/not-found',
  },
  {
    path: '/survey/:id',
    name: 'SurveyFill',
    component: () => import('@/views/SurveyFill.vue'),
  },
  {
    path: '/survey/:id/result',
    name: 'SurveyResult',
    component: () => import('@/views/SurveyResult.vue'),
  },
  {
    path: '/not-found',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
