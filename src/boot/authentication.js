import layout from '../layouts/Mylayout.vue'
import service from '../utils/request.js'
import Fingerprint2 from 'fingerprintjs2'
import { resetRouter } from '../router/index'
export default ({
  router,
  store,
  Vue
}) => {
  const whiteList = ['/login']
  console.log('生成指纹1')
  finger(store)
  router.beforeEach((to, from, next) => {
    // Now you need to add your authentication logic here, like calling an API endpoint
    let isExpire
    let username = localStorage.getItem('username')
    let token = localStorage.getItem('token')
    let userRoutes = localStorage.getItem('userRoutes')
    let expireTime = new Date(localStorage.getItem('expTime'))
    if (store.state.application.finger.length === 0) {
      console.log('生成指纹2')
      finger(store)
    }
    if (new Date() > expireTime) {
      isExpire = true
      store.commit('application/clearState')
      resetRouter()
      clearLocalStorage()
    }
    let dynamicRoutes = store.state.application.accessRoutes
    console.log('守护路由')
    // console.log(username + '  ' + token + '  ' + userRoutes)
    if (username && token && !isExpire) {
      if (!dynamicRoutes.length) {
        if (!userRoutes) {
          service.post('/api/login/getRoutes', {
            username: username
          }).then(resp => {
            console.log('获取路由')
            let routerStr = JSON.stringify(resp)
            localStorage.setItem('userRoutes', routerStr)
            dynamicRoutes = initRouters(routerStr)
            console.log('初始化路由')
            store.commit('application/generateRoutes', dynamicRoutes)
            router.addRoutes(dynamicRoutes)
            next({
              ...to,
              replace: true
            })
          })
        } else {
          console.log('添加动态路由')
          dynamicRoutes = initRouters(userRoutes)
          store.commit('application/generateRoutes', dynamicRoutes)
          router.addRoutes(dynamicRoutes)
          next({
            ...to,
            replace: true
          })
        }
      } else {
        next()
      }
    } else {
      if (whiteList.indexOf(to.path) !== -1) {
        console.log('白名单' + to.path)
        next()
      } else {
        console.log('没有找到token')
        next('/login')
      }
    }
  })
}

function initRouters (data) {
  let routes = JSON.parse(data)
  for (let route of routes) {
    route.component = layout
    for (let child of route.children) {
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

function clearLocalStorage () {
  localStorage.removeItem('username')
  localStorage.removeItem('token')
  localStorage.removeItem('userRoutes')
  localStorage.removeItem('expTime')
}

function finger (obj) {
  Fingerprint2.get(function (components) {
    let values = components.map(function (component) { return component.value })
    let murmur = Fingerprint2.x64hash128(values.join(''), 31)
    obj.commit('application/SET_FINGER', murmur)
    console.log('finger():' + obj.state.application.finger)
  })
}
