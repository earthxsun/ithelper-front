<template>
  <q-card style="width:335px; max-width: 350px;height: 350px">
    <q-card-section>
      <div class="row">
        <div class="text-h6 text-bold">上传申请表</div>
        <q-space/>
        <q-btn label="关闭" flat icon="close" color="red" @click="loadData" v-close-popup />
      </div>
    </q-card-section>
    <q-separator/>
    <q-card-section>
      <q-uploader
        url="api/account/uploadForm"
        fieldName="file"
        :headers="token"
        :form-fields="formId"
        label="只能上传PDF文件"
        :filter="checkFileType"
        style="max-width: 300px"
        @finish="finishUpload"
        @failed="uploadFail"
      />
    </q-card-section>

      <q-card-section>
<!--        <q-banner class="text-h6 shadow-1 shadow-box">已上传文件：{{accountDetail.status}}</q-banner>-->
        <div>已上传文件：{{uploadFileNum}}</div>
      </q-card-section>
    <q-card-section>
      <q-btn
        size="22px"
        style="width: 300px"
        class="q-px-xl q-py-xs"
        color="blue"
        label="查看上传的申请表"
        @click="viewFile"
      />
    </q-card-section>

  </q-card>
</template>

<script>
import service from '../utils/request.js'
export default {
  name: 'uploadFileForm',
  props: ['accountDetail'],
  data () {
    return {
      formId: [],
      uploadFileNum: 0,
      token: [{ name: 'TOKEN', value: this.$store.state.application.token }, { name: 'finger', value: this.$store.state.application.finger }]
    }
  },
  methods: {
    checkFileType (files) {
      return files.filter(file => file.type === 'application/pdf')
    },
    viewFile () {
      service({
        url: 'api/account/viewForm',
        method: 'get',
        params: { id: this.accountDetail.id },
        responseType: 'blob'
      }).then(resp => {
        let _this = this
        if (resp.type === 'application/json') {
          let blob = new Blob([resp], { type: 'application/json' })
          let read = new FileReader()
          read.readAsText(blob)
          read.onload = function () {
            let result = JSON.parse(read.result + '')
            _this.$q.notify({
              color: 'red',
              icon: 'error',
              position: 'center',
              timeout: 2000,
              classes: 'mynotifyfont',
              message: result.message
            })
            console.log(result)
          }
        } else {
          let blob = new Blob([resp], { type: 'application/pdf' })
          window.open(URL.createObjectURL(blob))
        }
      })
    },
    finishUpload () {
      console.log('上传完毕')
      this.uploadFileNum = 1
    },
    loadData () {
      this.$emit('reloadData')
    },
    uploadFail (callback) {
      let temp = JSON.parse(callback.xhr.response)
      this.$q.notify({
        color: 'red',
        icon: 'error',
        position: 'center',
        timeout: 3000,
        classes: 'mynotifyfont',
        message: '上传失败，错误：' + temp.code + ' ' + temp.message + ' 请联系管理员'
      })
    }
  },
  mounted () {
    this.formId[0] = { name: 'id', value: this.accountDetail.id }
    this.uploadFileNum = this.accountDetail.status
  }
}
</script>

<style lang="stylus" scoped >
  .shadow-box {
    width: 300px
  }
</style>
