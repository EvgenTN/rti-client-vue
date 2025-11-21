import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/admin/UsersListView.vue'),
      meta: { requiresAuth: true, requiresRole: 'Admin' },
    },
    {
      path: '/containers',
      name: 'containers',
      component: () => import('../views/ContainersMain.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/property-definition',
      name: 'propdef',
      component: () => import('../views/PropertyDefinition.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/lots',
      name: 'lots',
      component: () => import('../views/LotsMain.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/lots/create',
      name: 'lot-create',
      component: () => import('../views/LotCreate.vue'),
      meta: { requiresAuth: true, requiresRole: 'Operator' },
    },
    {
      path: '/lots/:name',
      name: 'lot-details',
      component: () => import('../views/LotDetails.vue'),
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/lots/:name/edit',
      name: 'lot-edit',
      component: () => import('../views/LotEdit.vue'),
      props: true,
      meta: { requiresAuth: true, requiresRole: 'Operator' },
    },
    {
      path: '/container/:name/info',
      name: 'container-info',
      component: () => import('../views/ContainerInfo.vue'),
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/actions',
      name: 'actions',
      component: () => import('../views/ActionsMain.vue'),
      meta: { requiresAuth: true, requiresRole: 'Operator' },
    },
  ],
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // Check if route requires guest (not logged in)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }

  // Check role-based access
  if (to.meta.requiresRole) {
    const requiredRole = to.meta.requiresRole as string
    const userRole = authStore.user?.role

    // Role hierarchy: Admin > Manager > Operator > Viewer
    const roleHierarchy: Record<string, number> = {
      'Admin': 4,
      'Manager': 3,
      'Operator': 2,
      'Viewer': 1,
    }

    const userRoleLevel = roleHierarchy[userRole || ''] || 0
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0

    if (userRoleLevel < requiredRoleLevel) {
      next({ name: 'home' })
      return
    }
  }

  next()
})

export default router

