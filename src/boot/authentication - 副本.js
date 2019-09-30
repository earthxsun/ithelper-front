import layout from '../layouts/Mylayout.vue'
// import account from '../pages/Account.vue'
export default ({
  router,
  store,
  Vue
}) => {
  const whiteList = ['/login']
  let dynamicRoutes
  router.beforeEach((to, from, next) => {
    // Now you need to add your authentication logic here, like calling an API endpoint
    let username = localStorage.getItem('username')
    let token = localStorage.getItem('token')
    let userRoutes = localStorage.getItem('userRoutes')
    console.log('守护路由')
    console.log(username + '  ' + token + '  ' + userRoutes)
    if (whiteList.indexOf(to.path) !== -1) {
      console.log('白名单' + to.path)
      next()
    }
    if (username && token) {
      if (!dynamicRoutes) {
        if (!userRoutes) {
          Vue.prototype.$axios('/api/test/getRoutes').then(resp => {
            localStorage.setItem('userRoutes', resp)
            let dynamicRoutes = initRouters(resp)
            console.log('初始化路由')
            console.log(dynamicRoutes)
            store.commit('application/generateRoutes', dynamicRoutes)
            router.addRoutes(dynamicRoutes)
            next({
              ...to,
              replace: true
            })
          })
        } else {
          dynamicRoutes = userRoutes
          next({
            ...to,
            replace: true
          })
        }
      } else {
        next()
      }
    } else {
      console.log('没有找到token')
      next('/login')
    }
  })
}

function initRouters (data) {
  // console.log(data.data.dynamicRoutes)
  let routes = data.data.dynamicRoutes
  for (let route of routes) {
    route.component = layout
    for (let child of route.children) {
      console.log(child.component)
      child.component = view(child.component)
    }
  }
  return routes
}

function view (path) {
  return function (resolve) {
    import('../pages' + path + '.vue').then(mod => {
      resolve(mod)
    })
  }
}
