import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import System from '../System.vue'
import Login from '../views/Login.vue'
import Logout from '../views/Logout.vue'
import LoginQR from '../views/LoginQR.vue'
import Home from '../views/Home.vue'
import IndexRedirect from '../views/IndexRedirect.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'IndexRedirect',
    component: IndexRedirect,
  },
  {
    path: '/sys',
    name: 'System',
    component: System,
    children: [
      {
        path: '',
        name: 'Home',
        component: Home
      },
      {
        path: 'configSystem',
        name: 'ConfigSystem',
        component: () => import(/* webpackChunkName: "configSystem" */ '../views/ConfigSystem.vue')
      },
      {
        path: 'user',
        name: 'User',
        component: () => import(/* webpackChunkName: "user" */ '../views/User.vue')
      },
      {
        path: 'userProfile',
        name: 'UserProfile',
        component: () => import(/* webpackChunkName: "userProfile" */ '../views/UserProfile.vue')
      },
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },  
  {
    path: '/login-qr',
    name: 'LoginQR',
    component: LoginQR
  },
  {
    path: '/Logout',
    name: 'Logout',
    component: Logout
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

console.log('BASE_URL: ' + process.env.BASE_URL);

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
})

export default router
