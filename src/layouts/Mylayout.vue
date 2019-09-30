<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat
               dense
               round
               @click="leftDrawerOpen = !leftDrawerOpen"
               aria-label="Menu">
          <q-icon name="menu" />
        </q-btn>

        <q-toolbar-title>
          IT Helper System
        </q-toolbar-title>

        <q-btn stretch flat class="text-h6" label="修改密码" @click="modifyPassword = true"/>
      </q-toolbar>
    </q-header>

    <q-drawer :width="250"
              v-model="leftDrawerOpen"
              bordered
              content-class="bg-grey-2">
      <q-scroll-area style="height: calc(100% - 50px); margin-top: 50px">
        <q-list padding>

          <q-item clickable
                  to="/index">
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6">首页</q-item-label>
            </q-item-section>
          </q-item>
          <!-- 动态加载菜单   -->
          <template v-for="(item,index) in sidemenu">
            <q-expansion-item class="text-h6"
                              :label="item.name"
                              :icon="item.icon"
                              :key="index"
                              :content-inset-level="0.5">
              <template v-for="(child,index) in item.children">
                <q-item clickable
                        :to="child.path"
                        :key="index">
                  <q-item-section avatar>
                    <q-icon :name="child.icon" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-subtitle1">{{child.name}}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-expansion-item>
          </template>
          <q-item clickable
                  @click="logout">
            <q-item-section avatar>
              <q-icon name="exit_to_app" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6">退出</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
      <div class="absolute-top bg-blue-8 elevated">
        <q-item style="height:50px">
          <q-item-section avatar>
            <q-chip>
              <q-avatar color="green" text-color="white">
                {{username.substring(0,1)}}
              </q-avatar>
              <div style="width: 150px" class="text-center text-bold">当前用户：{{username}}</div>
            </q-chip>
          </q-item-section>
        </q-item>
      </div>
    </q-drawer>
    <!--    修改密码弹窗-->
    <q-dialog v-model="modifyPassword" persistent>
      <q-card style="width:400px;height:350px; max-width: 400px;">
        <q-toolbar class="bg-blue text-white shadow-2 rounded-borders">
          <div class="text-h6">修改密码</div>
        </q-toolbar>
        <q-separator />
          <q-card-section>
            <div class="q-col-gutter-lg">
              <q-input v-model="password"
                       prefix="密码："
                       placeholder="请输入密码"
                       :type="isPwd ? 'password' : 'text'"
                       :rules="[ val => !!val && val.length >5 || '密码至少6位字符']">
                <template v-slot:append>
                  <q-icon :name="isPwd ? 'visibility_off' : 'visibility'"
                          class="cursor-pointer"
                          @click="isPwd = !isPwd" />
                </template>
              </q-input>
              <q-input v-model="ConfirmPassword"
                       :type="isPwd ? 'password' : 'text'"
                       prefix="确认密码："
                       placeholder="请再次输入密码"
                       :rules="[ val => !!val && val.length >5 || '密码至少6位字符']">
                <template v-slot:append>
                  <q-icon :name="isPwd ? 'visibility_off' : 'visibility'"
                          class="cursor-pointer"
                          @click="isPwd = !isPwd" />
                </template>
              </q-input>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn outline label="保存" color="primary" @click="updatePassword"/>
            <q-btn outline label="取消" color="primary" @click="modifyPassword = false"/>
          </q-card-actions>
<!--          <q-card-section><p v-show="errorMsg" class="text-red">两次输入的密码不相同</p></q-card-section>-->
      </q-card>
    </q-dialog>
    <!--    内容显示-->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
// import { openURL } from 'quasar'
import { resetRouter } from '../router/index'
import service from '../utils/request'
export default {
  name: 'layout',
  data () {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop,
      sidemenu: [],
      username: localStorage.getItem('username'),
      isPwd: 'password',
      modifyPassword: false,
      password: '',
      ConfirmPassword: '',
      errorMsg: false
    }
  },
  methods: {
    // openURL,
    logout () {
      this.$store.commit('application/clearState')
      // localStorage.removeItem('username')
      // localStorage.removeItem('token')
      // localStorage.removeItem('userRoutes')
      localStorage.clear()
      resetRouter()
      this.$router.push('/login')
    },
    getMenu () {
      this.sidemenu = this.$store.state.application.accessRoutes
    },
    updatePassword () {
      console.log('修改密码')
      if (this.password.length > 0) {
        if ((this.password === this.ConfirmPassword)) {
          console.log('密码相同')
          service.post('/api/user/updatePwd', {
            username: this.$store.state.application.username,
            password: this.password
          }).then(resp => {
            console.log(resp)
            if (resp.code === 99999) {
              localStorage.setItem('token', resp.data)
              this.modifyPassword = false
              this.$q.notify({
                color: 'blue',
                icon: 'thumb_up',
                position: 'center',
                timeout: 2000,
                message: resp.message
              })
            } else {
              this.modifyPassword = false
              this.$q.notify({
                color: 'red',
                icon: 'error',
                position: 'center',
                timeout: 2000,
                classes: 'mynotifyfont',
                message: resp.message
              })
            }
          })
        } else {
          this.$q.notify({
            color: 'red',
            icon: 'error',
            position: 'center',
            timeout: 1000,
            classes: 'mynotifyfont',
            message: '两次输入的密码不相同'
          })
        }
      } else {
        this.$q.notify({
          color: 'red',
          icon: 'error',
          position: 'center',
          timeout: 1000,
          classes: 'mynotifyfont',
          message: '请输入密码'
        })
      }
    }
  },
  mounted () {
    this.getMenu()
  }
}
</script>

<style >
  .mynotifyfont {
    font-size: 18px;
  }
</style>
