import layout from '../layouts/Mylayout.vue'

const routes = [{
  path: '/login',
  component: () => import('../pages/Login.vue')
},
{
  path: '/',
  redirect: '/index'
},
{
  path: '/index',
  component: layout,
  children: [{
    path: '',
    component: () => import('pages/Index.vue')
  }]
}
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
