import { RouteRecordRaw } from 'vue-router';
import { authRoutes } from './auth-routes';
import { adminRoutes } from './admin-routes';
import { userRoutes } from './user-routes';
import { commonRoutes } from './common-routes';
import { publicRoutes } from './public-routes';
import { superadminRoutes } from './superadmin-routes';
import { operatorRoutes } from './operator-routes';

// Combine all route groups into a single array
export const routes: RouteRecordRaw[] = [
  ...publicRoutes,
  ...authRoutes,
  ...adminRoutes,
  ...superadminRoutes,
  ...userRoutes,
  ...commonRoutes,
  ...operatorRoutes,
  // Catch-all / 404 route should be at the end
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/not-found.vue'),
    meta: {
      requiresAuth: false,
      layout: 'blank',
      title: 'Page Not Found'
    }
  }
]; 