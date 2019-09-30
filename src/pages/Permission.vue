<template>
  <div>
    <h1>权限管理</h1>
    <br>
    <br>
    <button @click="loadData">GetData</button>
    <div>{{getRole}}</div>
    <br>
    <br>
    <button @click="userData">Getuser</button>
    <br>
    <br>
    <button @click="branchData">GetBracnh</button>
    <br>
    <br>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import Fingerprint2 from 'fingerprintjs2'
// import axios from 'axios'
import service from '../utils/request'
export default {
  data () {
    return {
      checked: true,
      selected: [],
      data: [
        {
          name: 'Frozen Yogurt',
          calories: 159,
          fat: 6.0,
          carbs: 24,
          protein: 4.0,
          sodium: 87,
          calcium: '14%',
          iron: '1%'
        },
        {
          name: 'Ice cream sandwich',
          calories: 237,
          fat: 9.0,
          carbs: 37,
          protein: 4.3,
          sodium: 129,
          calcium: '8%',
          iron: '1%'
        },
        {
          name: 'Eclair',
          calories: 262,
          fat: 16.0,
          carbs: 23,
          protein: 6.0,
          sodium: 337,
          calcium: '6%',
          iron: '7%'
        },
        {
          name: 'Cupcake',
          calories: 305,
          fat: 3.7,
          carbs: 67,
          protein: 4.3,
          sodium: 413,
          calcium: '3%',
          iron: '8%'
        },
        {
          name: 'Gingerbread',
          calories: 356,
          fat: 16.0,
          carbs: 49,
          protein: 3.9,
          sodium: 327,
          calcium: '7%',
          iron: '16%'
        },
        {
          name: 'Jelly bean',
          calories: 375,
          fat: 0.0,
          carbs: 94,
          protein: 0.0,
          sodium: 50,
          calcium: '0%',
          iron: '0%'
        },
        {
          name: 'Lollipop',
          calories: 392,
          fat: 0.2,
          carbs: 98,
          protein: 0,
          sodium: 38,
          calcium: '0%',
          iron: '2%'
        },
        {
          name: 'Honeycomb',
          calories: 408,
          fat: 3.2,
          carbs: 87,
          protein: 6.5,
          sodium: 562,
          calcium: '0%',
          iron: '45%'
        },
        {
          name: 'Donut',
          calories: 452,
          fat: 25.0,
          carbs: 51,
          protein: 4.9,
          sodium: 326,
          calcium: '2%',
          iron: '22%'
        },
        {
          name: 'KitKat',
          calories: 518,
          fat: 26.0,
          carbs: 65,
          protein: 7,
          sodium: 54,
          calcium: '12%',
          iron: '6%'
        }
      ],
      name: '使用人名称',
      text: '',
      vselect: '',
      options: ['序号', '作者', '标题', '日期', 'Oracle', '巨航总公司'],
      sidemenu: [
        {
          menulink: '/index',
          menuicon: 'school',
          menutitle: '首页'
        },
        {
          menulink: '/account/index',
          menuicon: 'code',
          menutitle: '账号申请'
        },
        {
          menulink: '/user/index',
          menuicon: 'chat',
          menutitle: '用户管理'
        },
        {
          menulink: '/permission/index',
          menuicon: 'record_voice_over',
          menutitle: '权限管理'
        }
      ]
    }
  },
  methods: {
    ...mapActions('application', ['addnum']),
    loadData () {
      service({
        url: 'api/account/print',
        method: 'get',
        params: {
          id: 1
        },
        responseType: 'blob'
      }).then(resp => {
        console.log(resp)
        let blob = new Blob([resp], { type: 'application/pdf' })
        console.log(blob)
        // let filename = '123.pdf'
        // let link = document.createElement('a')
        // link.download = filename
        // link.href = URL.createObjectURL(blob)
        // document.body.appendChild(link)
        // link.click()
        // URL.revokeObjectURL(link.href)
        window.open(URL.createObjectURL(blob))
      })
    },
    userData () {
      service
        .get('/api/account/erpPermissions')
        .then(resp => {
          console.log(resp)
        })
        .catch(() => {
          console.log('load fail')
        })
    },
    branchData () {
      // this.$store.commit('application/SET_ROLE', '')
      service.get('api/test/gettest').then(resp => {
        console.log(resp)
      })
    },
    getfinger () {
      let _store = this.$store
      let murmur
      Fingerprint2.getPromise().then(function (components) {
        let values = components.map(function (component) { return component.value })
        murmur = Fingerprint2.x64hash128(values.join(''), 31)
        console.log('in ():' + murmur)
      })
      console.log('murmur:' + murmur)
      // _store.commit('application/SET_ROLE', murmur)
      console.log('finger():' + _store.state.application.role)
    }
  },
  computed: {
    getRole: function () {
      return this.$store.state.application.role
    }
  }
}
</script>

<style scoped>
</style>
