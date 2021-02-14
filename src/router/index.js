import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Register from '@/components/auth/Register.vue'
import Login from '@/components/auth/Login.vue'
import Dashboard from '@/components/home/Dashboard.vue'
import G_Dashboard from '@/components/home/G_Utils/G_Dashboard.vue'
import EditShoppingList from '@/components/home/EditShoppingList.vue'
import MyLists from '@/components/home/MyLists.vue'
import MyGroups from '@/components/home/MyGroups.vue'

import firebase from 'firebase'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: false,
      isGroupDashboard: false,
    }
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
    meta: {
      requiresAuth: false,
      isGroupDashboard: false,
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      requiresAuth: false,
      isGroupDashboard: false,
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false,
      isGroupDashboard: false,
    }
  },
  {
    path: '/le-mie-liste',
    name: 'MyLists',
    component: MyLists,
    meta: {
      requiresAuth: true,
      isGroupDashboard: false,
    }
  },
  {
    path: '/gruppi',
    name: 'MyGroups',
    component: MyGroups,
    meta: {
      requiresAuth: true,
      isGroupDashboard: false,
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
      isGroupDashboard: false,
    }
  },
  {
    path: '/:gName/dashboard',
    name: 'G_Dashboard',
    component: G_Dashboard,
    meta: {
      requiresAuth: true,
      isGroupDashboard: true,
    }
  },
  {
    path: '/:listName',
    name: 'EditShoppingList',
    component: EditShoppingList,
    meta: {
      requiresAuth: true,
      isGroupDashboard: false,
    }
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

/**
 * Creating the routeguard for the components which require authentication. If the user isn't logged in, then it will be redirected to the login page.
 */
router.beforeEach((to, from, next) => {
  // console.log(to,from,next);
  /**
   * Firstly we check if the route we are looking for requires the authentication.
   */
  if (to.matched.some(ref => ref.meta.requiresAuth)) {
    /**
     * Then we check for the user state (logged in or not)
     */
    let user = firebase.auth().currentUser
    if (user) {
      next()
    } else {
      /**
       * The user is not logged in. We redirect him to the login page.
       */
      next({ name: 'Login' })
    }
  } else {
    next()
  }
})

export default router
