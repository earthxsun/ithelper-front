import Mock from 'mockjs'
const Random = Mock.Random
const code = 200
var branchnames = ['关务中心', '巨航加工区', '机保报关部', '清溪物流园']
Random.extend({
  branchname: function (date) {
    // let branchnames = ['关务中心', '巨航加工区', '机保报关部', '清溪物流园']
    return this.pick(branchnames)
  }
})
Random.extend({
  role: function (date) {
    let roles = ['管理员', '普通用户']
    return this.pick(roles)
  }
})

const postData = req => {
  let posts = []

  for (let i = 0; i < 10; i++) {
    let post = {
      id: i + 1,
      title: Random.csentence(5, 10),
      author: Random.cname(),
      date: Random.date()
    }
    posts.push(post)
  }
  return {
    code,
    posts
  }
}

const userData = () => {
  let posts = []

  for (let i = 0; i < 10; i++) {
    let post = {
      'id': i + 1,
      'username': Random.cname(),
      'role': Random.role(),
      'branch': Random.branchname(),
      'status': Random.boolean(),
      'date': Random.date()
    }
    posts.push(post)
  }
  return {
    code,
    posts
  }
}

const validateUser = (data) => {
  // let menu=['用户管理','权限管理']
  console.log(JSON.parse(data.body))
  let sidemenu = []
  let obj = JSON.parse(data.body)
  if (obj.username === 'admin') {
    sidemenu = [{
      parentlabel: '系统管理',
      parenticon: 'enhanced_encryption',
      children: [{
        menulink: '/account',
        menuicon: 'account_box',
        menutitle: '账号申请'
      }]
    },
    {
      parentlabel: '系统设置',
      parenticon: 'settings',
      children: [{
        menulink: '/user',
        menuicon: 'perm_identity',
        menutitle: '用户管理'
      },
      {
        menulink: '/permission',
        menuicon: 'perm_data_setting',
        menutitle: '权限管理'
      }
      ]
    }
    ]
  }
  return {
    sidemenu
  }
}

const routesData = () => {
  let dynamicRoutes = [{
    path: '/index',
    component: 'layout',
    name: '系统组手',
    icon: 'enhanced_encryption',
    children: [{
      path: '/account',
      name: '账号申请',
      icon: 'account_box',
      component: '/Account',
      meta: {
        roles: ['admin', 'user']
      }
    }]
  },
  {
    path: '/index',
    component: 'layout',
    name: '系统设置',
    icon: 'settings',
    children: [{
      path: '/user',
      name: '用户管理',
      icon: 'perm_identity',
      component: '/User',
      meta: {
        roles: ['admin']
      }
    },
    {
      path: '/permission',
      name: '权限管理',
      icon: 'perm_data_setting',
      component: '/Permission',
      meta: {
        roles: ['admin']
      }
    }
    ]
  }
  ]
  return {
    dynamicRoutes
  }
}

Mock.mock('/posts', 'get', postData)
Mock.mock('/getuser', 'get', userData)
Mock.mock('/getbranch', 'get', branchnames)
Mock.mock('/userlogin', 'post', validateUser)
Mock.mock('/getroutes', 'get', routesData)
