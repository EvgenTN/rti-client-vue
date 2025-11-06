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
      path: '/lots/create',
      name: 'lot-create',
      component: () => import('../views/LotCreate.vue'),
    },
    {
      path: '/lots/:name',
      name: 'lot-details',
      component: () => import('../views/LotDetails.vue'),
      props: true,
    },
    {
      path: '/lots/:name/edit',
      name: 'lot-edit',
      component: () => import('../views/LotEdit.vue'),
      props: true,
    },
    {
      path: '/container/:name/info',
      name: 'container-info',
      component: () => import('../views/ContainerInfo.vue'),
      props: true,
    },
    {
      path: '/actions',
      name: 'actions',
      component: () => import('../views/ActionsMain.vue'),
    },
  ],
})

export default router
