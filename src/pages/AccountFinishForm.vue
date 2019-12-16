<template>
      <q-card style="width:550px; max-width: 580px;height: 500px" >
        <q-card-section>
            <div class="text-h6 text-bold">账号详情</div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="q-gutter-sm">
          <q-btn rounded outline color="primary" icon="add" @click="addRow" :disable="notUse" v-has-permission="'管理员'"></q-btn>
          <q-btn rounded outline color="primary" icon="remove" @click="reduceRow" :disable="notReduceRow" v-has-permission="'管理员'"></q-btn>
<!--          <q-btn rounded outline color="primary" icon="edit" @click="modifyData" :disable="notUse"></q-btn>-->
          <q-btn rounded outline color="red" label="删除全部" icon="replay" @click="delAll" :disable="notUse" v-has-permission="'管理员'"></q-btn>
        </q-card-section>
        <q-separator/>
        <q-form @submit="submitForm">
          <q-card-section v-for="(d,index) in formRows" :key="index" class="row q-gutter-sm">
            <q-select v-model="formData.sysName[index]" :options="sysNameOptions" prefix="系统名称：" :hint="defaultPwd[index]" dense :disable="notUse" ></q-select>
            <br>
            <q-input v-model="formData.accountName[index]" prefix="账号名称：" placeholder="请输入账号名称" style="width:300px" :hint="pwdTips[index]" dense :readonly="notUse"
                     :rules="[val => val !== null && val !== '' || '此为必填项']"/>
          </q-card-section>
          <q-separator/>
          <q-card-section>
            <div class="row q-gutter-sm justify-end">
              <q-btn  outline label="完成" color="primary" type="submit" dense :disable="notUse" v-has-permission="'管理员'"/>
              <q-btn outline label="关闭" color="red" dense v-close-popup />
            </div>
          </q-card-section>
        </q-form>
      </q-card>
</template>

<script>
import service from '../utils/request'
export default {
  data () {
    return {
      sysNameOptions: [],
      defaultPwd: [''],
      pwdTips: [],
      systemDetails: {},
      formRows: [{}],
      notUse: false,
      notReduceRow: false,
      formData: {
        id: this.accountDetail.id,
        sysName: [],
        accountName: ['']
      }
    }
  },
  props: ['accountDetail', 'systemAccounts'],
  methods: {
    addRow () {
      this.formRows.push({})
    },
    reduceRow () {
      this.formRows.pop()
      let lastSysName = this.formData.sysName.pop()
      if (this.formData.sysName.length > 0) {
        service.get('api/accountName/delOne', {
          params: {
            accountId: this.formData.id,
            sysName: lastSysName
          }
        }).then(resp => {
          console.log(resp)
        })
      }
    },
    loadData () {
      this.systemDetails = this.systemAccounts
      for (let r of this.systemDetails) {
        this.sysNameOptions.push(r.name)
      }
      let role = this.$store.state.application.role
      this.notUse = this.accountDetail.status === 'finish' || role !== '管理员'
      this.notReduceRow = this.accountDetail.status === 'finish' || this.accountDetail.status === '已提交'
    },
    loadFormData () {
      service.get('api/accountName/getOne', {
        params: {
          accountId: this.formData.id
        }
      }).then(resp => {
        const _this = this
        const accountNames = resp.data
        this.formRows = []
        if (accountNames.length > 0) {
          for (let i = 0; i < resp.data.length; i++) {
            this.formRows.push({})
          }
          accountNames.forEach(function (value, index) {
            _this.formData.sysName[index] = value.system
            _this.formData.accountName[index] = value.accountName
            for (let s of _this.systemDetails) {
              if (value.system === s.name) {
                _this.defaultPwd[index] = s.defaultPassword
                _this.pwdTips[index] = s.passwordTip
              }
            }
          })
        }
      })
    },
    submitForm () {
      // console.log('提交')
      // console.log(this.formData.accountName[0])
      service.post('api/accountName/add', {
        accountId: this.formData.id,
        sysName: this.formData.sysName,
        accountName: this.formData.accountName
      }).then(resp => {
        if (resp.code === 99999) {
          this.$q.notify({
            color: 'green',
            icon: 'thumb_up',
            position: 'center',
            timeout: 2000,
            message: resp.message
          })
          this.$emit('closeForm')
        } else {
          this.$q.notify({
            color: 'red',
            icon: 'error',
            position: 'center',
            timeout: 2000,
            classes: 'mynotifyfont',
            message: resp.message
          })
          this.$emit('closeForm')
        }
      })
    },
    delAll () {
      console.log(this.formData.id)
      service.get('api/accountName/del', {
        params: {
          accountId: this.formData.id
        }
      }).then(resp => {
        console.log(resp)
        if (resp.code === 99999) {
          this.$q.notify({
            color: 'green',
            icon: 'thumb_up',
            position: 'center',
            timeout: 2000,
            message: resp.message
          })
        } else {
          this.$q.notify({
            color: 'red',
            icon: 'error',
            position: 'center',
            timeout: 2000,
            message: resp.message
          })
        }
        this.$emit('closeForm')
      })
    }
  },
  watch: {
    'formData.sysName': {
      handler: function (val) {
        let _this = this
        val.forEach(function (value, index) {
          for (let s of _this.systemDetails) {
            if (value === s.name) {
              _this.defaultPwd[index] = s.defaultPassword
              _this.pwdTips[index] = s.passwordTip
            }
          }
        })
      }
    }
  },
  directives: {
    hasPermission: {
      bind (el, binding, vnode) {
        let perm = vnode.context.$store.state.application.role
        if (perm !== binding.value) {
          if (!el.parentNode) {
            el.style.display = 'none'
          } else {
            el.parentNode.removeChild(el)
          }
        }
      }
    }
  },
  mounted () {
    // console.log('子组件：----加载完----')
    this.loadData()
    this.loadFormData()
  }
}
</script>
<style lang="stylus">
  .q-field__prefix {
    color: $blue-8;
  }
</style>
