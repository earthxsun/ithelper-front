<template>
  <div class="q-pa-md">
    <q-card class="bg-secondary text-white">
      <q-card-section class="q-gutter-sm">
        <h1>欢迎使用本系统</h1>
        <h6>你上次登录的时间：{{lastLoginTime}}</h6>
      </q-card-section>
    </q-card>
  </div>

</template>

<style>
</style>

<script>
// import service from '../utils/request'
import { date } from 'quasar'
export default {
  name: 'PageIndex',
  data () {
    return {
      lastLoginTime: ''
    }
  },
  mounted () {
    this.lastLoginTime = date.formatDate(localStorage.getItem('lastLoginTime'), 'YYYY-MM-DD HH:mm')
  }
}
</script>
<style lang="stylus" scoped>
  .my-card
    height 700px
</style>
