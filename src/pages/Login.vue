<template>
  <div class="fixed-center">
    <q-card style="width:400px;height:350px; max-width: 400px;">
      <q-toolbar class="bg-blue-grey-1 shadow-2 rounded-borders">
        <div class="text-h6 absolute-center">系统登录</div>
      </q-toolbar>

      <q-separator />

      <q-card-section style="max-height: 50vh">
        <div class="q-col-gutter-lg">
          <q-input v-model="text"
                   prefix="用户名："
                   placeholder="请输入用户名"></q-input>
          <q-input v-model="password"
                   :type="isPwd ? 'password' : 'text'"
                   prefix="密码："
                   placeholder="请输入密码">
            <template v-slot:append>
              <q-icon :name="isPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isPwd = !isPwd" />
            </template>
          </q-input>
        </div>
      </q-card-section>

      <q-card-actions>
        <q-btn color="blue"
               label="登录"
               v-close-popup
               style="width:400px"
               @click="login" />
      </q-card-actions>
      <q-card-section><p v-show="isShow" class="text-red">{{errorMsg}}</p></q-card-section>
    </q-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      text: '',
      password: '',
      isPwd: true,
      isShow: false,
      errorMsg: ''
    }
  },
  methods: {
    login () {
      let finger = this.$store.state.application.finger
      let username = this.text
      let password = this.password
      this.$axios
        .post('/api/login', {
          username: username,
          password: password,
          finger: finger
        })
        .then(resp => {
          if (resp.data.code === 99999) {
            localStorage.setItem('username', resp.data.data.username)
            localStorage.setItem('token', resp.data.data.token)
            localStorage.setItem('expTime', resp.data.data.exp_time)
            localStorage.setItem('lastLoginTime', resp.data.data.lastLoginTime)
            localStorage.setItem('role', resp.data.data.role)
            localStorage.setItem('org', JSON.stringify(resp.data.data.org))
            this.$store.commit('application/SET_USERNAME', resp.data.data.username)
            this.$store.commit('application/SET_ROLE', resp.data.data.role)
            this.$store.commit('application/SET_TOKEN', resp.data.data.token)
            this.$router.push('/index')
          } else {
            this.isShow = true
            this.errorMsg = resp.data.message
          }
        }).catch(error => {
          console.log(error.response.data)
          this.isShow = true
          this.errorMsg = error.response.data.message
        })
    }
  }
}
</script>

<style scoped>
</style>
