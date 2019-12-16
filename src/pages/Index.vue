<template>
  <div class="q-pa-md">
    <q-card class="bg-secondary text-white">
      <q-card-section class="q-gutter-sm">
        <h1>欢迎使用本系统</h1>
        <h6>你上次登录的时间：{{lastLoginTime}}</h6>
        <h6>暂存的申请表：{{saveStatusCount}}份</h6>
        <h6>已提交的申请表：{{submitStatusCount}}份</h6>
      </q-card-section>
    </q-card>
  </div>

</template>

<style>
</style>

<script>
import service from '../utils/request'
import { date } from 'quasar'
export default {
  name: 'PageIndex',
  data () {
    return {
      lastLoginTime: '',
      saveStatusCount: 0,
      submitStatusCount: 0,
      finishStatusCount: 0
    }
  },
  methods: {
    loadData () {
      service.get('api/account/statistics').then(resp => {
        if (resp.code === 99999) {
          this.saveStatusCount = resp.data.saveCount
          this.submitStatusCount = resp.data.submitCount
          this.finishStatusCount = resp.data.finishCount
        }
      })
    }
  },
  mounted () {
    this.lastLoginTime = date.formatDate(localStorage.getItem('lastLoginTime'), 'YYYY-MM-DD HH:mm')
    this.loadData()
  }
}
</script>
<style lang="stylus" scoped>
  .my-card
    height 700px
</style>
