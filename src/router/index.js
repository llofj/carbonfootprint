// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/calculator',
    name: 'Calculator',
    component: () => import('@/views/CarbonCalculatorPage.vue')
  },
  {
    path: '/pet',
    name: 'VirtualPet',
    component: () => import('@/views/VirtualPetPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/achievements',
    name: 'Achievements',
    component: () => import('@/views/AchievementsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ranking',
    name: 'Ranking',
    component: () => import('@/views/LeaderboardPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 导航守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token')
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router