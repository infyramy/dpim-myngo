import type { RouteRecordRaw } from 'vue-router';

export const commonRoutes: RouteRecordRaw[] = [
  {
    path: '/notifications',
    name: 'notifications',
    component: () => import('@/pages/notifications/index.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin', 'manager', 'user'],
      layout: 'dashboard',
      title: 'Notifications'
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/pages/profile/index.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin', 'manager', 'user', 'superadmin'],
      layout: 'dashboard',
      title: 'Profile'
    }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/pages/setting/index.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin', 'manager', 'user', 'superadmin'],
      layout: 'dashboard',
      title: 'Settings'
    }
  }
]; 