import layout from '../layouts/Mylayout.vue'
export const dynamicRoutes = [{
  path: '/index',
  component: layout,
  name: '系统组手',
  icon: 'enhanced_encryption',
  children: [{
    path: '/account',
    name: '账号申请',
    icon: 'account_box',
    component: () => import('../pages/Account.vue'),
    meta: {
      roles: ['admin', 'user']
    }
  }]
},
{
  path: '/index',
  component: layout,
  name: '系统设置',
  icon: 'settings',
  children: [{
    path: '/user',
    name: '用户管理',
    icon: 'perm_identity',
    component: () => import('pages/User.vue'),
    meta: {
      roles: ['admin']
    }
  },
  {
    path: '/permission',
    name: '权限管理',
    icon: 'perm_data_setting',
    component: () => import('pages/Permission.vue'),
    meta: {
      roles: ['admin']
    }
  }
  ]
}
]
