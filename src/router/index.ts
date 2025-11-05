import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/containers',
      name: 'containers',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/ContainersMain.vue'),
    },
    {
      path: '/property-definition',
      name: 'propdef',
      component: () => import('../views/PropertyDefinition.vue'),
    },
    {
      path: '/lots',
      name: 'lots',
      component: () => import('../views/LotsMain.vue'),
    },
    {
      path: '/container/:name/info',
      name: 'container-info',
      component: () => import('../views/ContainerInfo.vue'),
      props: true,
    },
  ],
})

export default router
