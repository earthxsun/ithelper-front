<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section class="q-gutter-sm">
        <div class="row q-gutter-sm">
          <q-btn color="primary" icon="open_in_new" label="查看" rounded outline @click="view"/>
          <q-btn color="primary" icon="add" label="新增" rounded outline @click="add" />
          <q-btn color="primary" icon="edit" label="编辑" rounded outline @click="edit" :disable="editBtn"/>
          <q-btn color="secondary" icon="done" label="完成提交" rounded outline @click="refer('submit')" v-show="!referBtn" :disable="disableReferBtn"/>
          <q-btn color="secondary" icon="done" label="取消提交" rounded outline @click="refer('save')" v-show="referBtn" :disable="disableReferBtn"/>
          <q-btn color="secondary" icon="print" label="打印预览" rounded outline @click="printPdf" :disable="printBtn"/>
          <q-btn color="positive" icon="how_to_reg" label="账号信息" rounded outline @click="finishJob" :disable="accountDetailBtn"/>
          <q-btn color="black" icon="cloud_upload" label="上传文件" rounded outline @click="uploadFile" :disable="printBtn" v-show="showUploadBtn"/>
          <q-btn color="black" icon="cloud_upload" label="查看文件" rounded outline @click="viewFile" :disable="printBtn" v-show="!showUploadBtn"/>
          <q-btn color="negative" icon="how_to_reg" label="取消完成" rounded outline @click="refer('submit')" :disable="cancelFinishBtn" v-has-permission="'管理员'"/>
          <q-btn color="red" icon="clear" label="作废申请" rounded outline @click="refer('invalid')" :disable="invalidBtn" v-show="showInvalidBtn"/>
          <q-btn color="red" icon="clear" label="取消作废" rounded outline @click="refer('save')" :disable="invalidBtn" v-show="!showInvalidBtn"/>
          <q-btn color="info" icon="replay" label="刷新数据" rounded outline @click="reloadAll"/>
        </div>
        <div class="q-gutter-sm row" style="margin-right:50px;">
          <q-select outlined rounded dense bottom-slots v-model="searchWord" :options="searchOptions" style="width:120px" />
          <q-input bottom-slots v-model="pagination.searchContent" v-if="searchWord.value === 'name' || searchWord.value === 'id'" placeholder="请输入搜索内容...." style="width:250px;"  dense rounded outlined>
            <template v-slot:after>
              <q-btn outline rounded icon="search" color="green"  @click="lookup"/>
            </template>
          </q-input>
          <q-select bottom-slots outlined rounded dense style="width:250px" v-show="showFixSearch" v-model="pagination.searchContent" :options="FixSearchOptions">
            <template v-slot:after>
              <q-btn  outline rounded icon="search" color="green"   @click="lookup"/>
            </template>
          </q-select>
          <q-input bottom-slots v-model="startDate" v-if="searchWord.value === 'date'" mask="date" :rules="['date']" dense outlined rounded style="width: 180px">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="qDateProxyStart" transition-show="scale" transition-hide="scale">
                  <q-date minimal v-model="startDate" @input="() => $refs.qDateProxyStart.hide()" />
                </q-popup-proxy>
              </q-icon>
            </template>
            <template v-slot:after>
              <div >到</div>
            </template>
          </q-input>
          <q-input bottom-slots v-model="endDate" v-if="searchWord.value === 'date'" mask="date" :rules="['date']" dense outlined rounded style="width: 250px">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="qDateProxyEnd" transition-show="scale" transition-hide="scale">
                  <q-date minimal v-model="endDate" @input="() => $refs.qDateProxyEnd.hide()" />
                </q-popup-proxy>
              </q-icon>
            </template>
            <template v-slot:after>
              <q-btn  outline rounded icon="search" color="green" label="查询"  @click="lookup"/>
            </template>
          </q-input>
        </div>
      </q-card-section>
    </q-card>

    <br />
<!--申请表表格-->
    <q-table class="myfont" :data="tableData" :columns="columns" row-key="id" selection="single"
             :selected.sync="selectRows" :visible-columns="visibleCols" :pagination.sync="pagination"
             no-data-label = "没找到数据"
             @selection="monitorStatus" @request="loadData" binary-state-sort>
    </q-table>
<!--    申请表单-->
    <q-dialog v-model="AccountForm" persistent>
      <q-card style="width:1000px;height:650px; max-width: 990px;" >
        <q-card-section>
          <div class="row">
            <div class="text-h6 text-bold">{{formTitle}}</div>
            <q-space/>
            <q-btn flat icon="close" @click="onReset" ></q-btn>
          </div>
        </q-card-section>
        <q-separator />
        <q-form @submit="subForm" @reset="onReset">
          <q-card-section>
            <div class="row q-col-gutter-md">
              <q-input v-model="formData.name" prefix="使用人姓名：" placeholder="请输入姓名" style="width:220px" dense
                       :rules="[val => val !== null && val !== '' || '此为必填项',val => val.indexOf(' ') < 0 || '不能有空格']" :disable="onlyView"
              />
              <q-input v-model="formData.tel" prefix="手机号码：" placeholder="请输入手机号码" style="width:220px" dense
                       :rules="[val => val !== null && val !== '' || '此为必填项',val => val.match('0?(13|14|15|17|18|19)[0-9]{9}') && val.length === 11 || '手机号码不正确']" :disable="onlyView"/>
              <q-input v-model="formData.post" prefix="岗位/职务：" placeholder="请输入岗位" style="width:200px" dense
                       :rules="[val => val !== null && val !== '' || '此为必填项',val => val.indexOf(' ') < 0 || '不能有空格']" :disable="onlyView"
              />
              <q-input v-model="formData.email" prefix="邮箱地址：" placeholder="请输入邮箱地址" style="width:300px" dense
                       :rules="[val => val !== null && val !== '' || '此为必填项',val => val.match('\\w[-\\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\\.)+[A-Za-z]{2,14}') || '邮箱地址不正确']" :disable="onlyView"/>
            </div>
          </q-card-section>
          <q-card-section>
            <div class="row q-col-gutter-md">
              <q-select v-model="formData.dept" :options="branchOptions" multiple prefix="部门/公司：" placeholder="请选择部门或者公司" style="width:400px" dense
                        :rules="[val => val !== null && val !== '' || '此为必填项']" :disable="onlyView"
              />

              <q-select v-model="formData.group" :options="groupOptions" prefix="组别：" placeholder="请选择组别" style="width:150px" dense
                        :rules="[val => val !== null && val !== '' || '此为必填项']" :disable="onlyView"
              />
              <q-select v-model="formData.applicationType" :options="applicationTypeOptions" prefix="申请类型：" placeholder="请选择" style="width:200px" dense
                        :rules="[val => val !== null && val !== '' || '此为必填项']" :disable="onlyView"
              />
              <q-input v-model="formData.reason" prefix="申请原因：" placeholder="请输入申请原因" style="width:400px" dense
                       :rules="[val => val !== null && val !== '' || '此为必填项']" :disable="onlyView"/>
            </div>
          </q-card-section>
          <q-separator />
          <template v-for="(val) in requiredSystemPermissions">
            <q-card-section class="row q-gutter-sm" :key="val.index">
                <template v-if="val.name !== '关贸云'">
                  <div class="row q-gutter-sm">
                    <div class="text-blue-8">{{ val.name }}权限：</div>
                    <!--                <q-option-group v-model="val.value" v-if="val.name !== '金蝶EAS'" :options="val.org" color="green" type="checkbox" inline dense :disable="onlyView"></q-option-group>-->
<!--                    <q-option-group v-model="val.value" v-if="val.name === '关贸云'" :options="val.org" color="green" type="checkbox" inline dense :disable="onlyView"></q-option-group>-->
                    <q-option-group v-model="val.perm" :options="val.permissionOptions" color="green" type="checkbox" inline dense :disable="onlyView"></q-option-group>
                  </div>
                </template>
                <template v-if="val.name === '关贸云'">
                  <div class="row q-gutter-sm">
                    <div class="text-blue-8">{{ val.name }}：</div>
                    <q-option-group v-model="val.value"  :options="val.org" color="green" type="checkbox" inline dense :disable="onlyView"></q-option-group>
                  </div>
                  <div class="row q-gutter-sm">
                    <div class="text-blue-8">权限:</div>
                    <q-option-group v-model="val.perm" :options="val.permissionOptions" color="green" type="checkbox" inline dense :disable="onlyView"></q-option-group>
                  </div>
                </template>
            </q-card-section>
            <q-separator :key="val.index"/>
          </template>
          <q-card-section>
            <q-input v-model="formData.otherPerm" prefix="其他权限：" placeholder="请输入需要的其他权限" style="width:700px" :disable="onlyView" dense/>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right">
            <q-btn outline dense label="保存" type="submit" color="primary" :disable="onlyView"/>
            <q-btn outline dense label="取消" color="red" type="reset"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
<!--    账号信息-->
    <q-dialog v-model="accountFinishFormShow" persistent>
      <account-finish-form :accountDetail="accountDetail" :systemAccounts="systemAccountDetail"  @closeForm="closeForm"></account-finish-form>
    </q-dialog>
<!--    上传文件-->
    <q-dialog v-model="showUploadFileForm"  persistent>
      <upload-file-form :accountDetail="accountDetail" @reloadData="reloadAll"></upload-file-form>
    </q-dialog>
  </div>
</template>

<script>
import { date } from 'quasar'
import service from '../utils/request.js'
import accountFinishForm from './AccountFinishForm'
import uploadFileForm from './UploadFileForm'
export default {
  data () {
    return {
      selectRows: [],
      clickTableRow: '',
      pagination: {
        sortBy: 'id',
        descending: true,
        page: 1,
        rowsPerPage: 7,
        rowsNumber: 20,
        keyWord: '',
        searchContent: ''
      },
      startDate: '',
      endDate: '',
      showUploadBtn: true,
      showFinishBtn: true,
      showInvalidBtn: true,
      cancelFinishBtn: false,
      printBtn: false,
      referBtn: false,
      disableReferBtn: false,
      editBtn: false,
      invalidBtn: false,
      accountDetailBtn: true,
      onlyView: false,
      disableWithUser: true,
      formTitle: '',
      submitMethod: '',
      visibleCols: ['num', 'id', 'name', 'dept', 'applicationType', 'createdBy', 'createTime', 'status', 'uploadFileNum'],
      columns: [
        { name: 'num', align: 'left', label: '序号', field: 'num' },
        { name: 'id', align: 'left', label: '申请表号', field: 'id', sortable: true },
        { name: 'name', align: 'left', label: '使用人', field: 'name' },
        { name: 'dept', align: 'left', label: '所在公司/部门', field: 'dept' },
        { name: 'applicationType', align: 'left', label: '申请类型', field: 'applicationType', sortable: true },
        { name: 'createdBy', align: 'left', label: '创建人', field: 'createdBy' },
        { name: 'createTime', align: 'left', label: '创建时间', field: 'createTime', format: val => date.formatDate(val, 'YYYY-MM-DD HH:mm'), sortable: true },
        { name: 'status',
          align: 'left',
          label: '状态',
          field: 'status',
          format: val => {
            if (val === 'save') { return '暂存' } else if (val === 'submit') { return '已提交' } else if (val === 'finish') { return '已完成' } else { return '作废' }
          },
          sortable: true },
        { name: 'uploadFileNum',
          align: 'left',
          label: '是否已上传申请表',
          field: 'uploadFileNum',
          format: val => {
            if (val > 0) { return '是' } else { return '否' }
          } }
      ],
      searchWord: {
        label: '申请人',
        value: 'name'
      },
      formData: {
        name: '',
        group: '',
        dept: null,
        post: '',
        email: '',
        tel: '',
        reason: '',
        otherPerm: '',
        applicationType: ''
      },
      sysPermissionOptions: [],
      requiredSystemPermissions: [],
      tableData: [],
      searchOptions: [{
        label: '申请人',
        value: 'name'
      }, {
        label: '申请表号',
        value: 'id'
      },
      {
        label: '申请类型',
        value: 'type'
      }, {
        label: '部门/公司',
        value: 'branch'
      }, {
        label: '状态',
        value: 'status'
      }, {
        label: '日期',
        value: 'date'
      }],
      showFixSearch: false,
      FixSearchOptions: [],
      branchOptions: [],
      easBranchOptions: [],
      groupOptions: [],
      organizationOptions: [],
      applicationTypeOptions: [],
      systemAccountDetail: [],
      AccountForm: false,
      accountFinishFormShow: false,
      showUploadFileForm: false,
      accountDetail: {
        id: 0,
        status: ''
      },
      isShowDetailPermission: false,
      test: true
    }
  },
  components: { accountFinishForm, uploadFileForm },
  methods: {
    loadData (props) {
      // 加载表格数据
      service.post('api/account/getAll', {
        rowsPerPage: props.pagination.rowsPerPage,
        rowsNumber: props.pagination.rowsNumber,
        page: props.pagination.page,
        sortBy: props.pagination.sortBy,
        descending: props.pagination.descending,
        searchContent: props.pagination.searchContent,
        keyWord: props.pagination.keyWord,
        startDate: this.startDate,
        endDate: this.endDate
      }).then(resp => {
        // console.log(resp.data.data)
        if (resp.code === 99999) {
          this.tableData = resp.data.data
          this.pagination.page = resp.data.page
          this.pagination.rowsPerPage = resp.data.rowsPerPage
          this.pagination.rowsNumber = resp.data.rowsNumber
          this.pagination.descending = resp.data.descending
          this.pagination.sortBy = resp.data.sortBy
        }
      })
      // 根据用户获取部门信息
      service.get('/api/account/getDept').then(resp => {
        this.branchOptions = []
        this.easBranchOptions = []
        let arr = resp.data
        for (let r of arr) {
          this.branchOptions.push(r)
          this.easBranchOptions.push({ label: r, value: r })
        }
        // this.formData.dept = this.branchOptions[0]
        if (arr.length === 1) {
          this.disableWithUser = false
        }
      }).catch(() => {
        // console.log('load branch fail')
      })
      // 加载系统名称和系统权限
      service.get('api/system').then(resp => {
        const temp = []
        let org = []
        let orgValue = []
        resp.data.forEach(function (value, index) {
          if (value.name === '关贸云') {
            org = [{ label: '物流', value: '物流' }, { label: '综合', value: '综合' }, { label: '东诚', value: '东诚' }]
          } else {
            org = JSON.parse(localStorage.getItem('org'))
          }
          temp[index] = { name: value.name, value: orgValue, perm: [], permissionOptions: value.permission, org: org }
        })
        this.requiredSystemPermissions = temp
      })
      // 加载表单所需基础信息
      service.get('api/account/data').then(resp => {
        for (let key in resp.data) {
          if (key === '申请类型') {
            this.applicationTypeOptions = []
            let obj = resp.data[key].firstOptions
            for (let o of obj) {
              this.applicationTypeOptions.push(o.label)
            }
          }
          if (key === '组别') {
            this.groupOptions = []
            let groupObj = resp.data[key].firstOptions
            for (let g of groupObj) {
              this.groupOptions.push(g.label)
            }
          }
        }
      })
      // 加载系统名信息
      service.get('api/system').then(resp => {
        this.systemAccountDetail = resp.data
      })
    },
    reloadAll () {
      this.pagination.page = 1
      this.pagination.rowsPerPage = 7
      this.pagination.rowsNumber = 10
      this.pagination.searchContent = ''
      this.pagination.keyWord = ''
      this.pagination.sortBy = 'id'
      this.loadData({ pagination: this.pagination })
      this.selectRows = []
    },
    subForm () {
      this.formData['requiredSystemPermissions'] = this.requiredSystemPermissions
      service.post('api/account', {
        formData: JSON.stringify(this.formData),
        method: this.submitMethod
      }).then(resp => {
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
            classes: 'mynotifyfont',
            message: resp.message
          })
        }
        this.onReset()
        this.reloadAll()
      })
    },
    onReset () {
      this.AccountForm = false
      this.onlyView = false
      for (let f of Object.keys(this.formData)) {
        if (typeof this.formData[f] === 'string') {
          this.formData[f] = ''
        } else {
          this.formData[f] = []
        }
      }
      for (let r of this.requiredSystemPermissions) {
        r.value = []
        r.perm = []
      }
    },
    view () {
      this.formTitle = '查看申请表'
      this.onlyView = true
      this.getAccount()
    },
    add () {
      this.formTitle = '新增申请表'
      this.submitMethod = 'add'
      this.AccountForm = true
    },
    edit () {
      this.formTitle = '编辑申请表'
      this.submitMethod = 'edit'
      this.getAccount()
    },
    refer (status) {
      // status（申请表状态）：save（暂存），submit（已提交），finish（已完成），invalid（作废）
      if (this.selectRows.length === 1) {
        // 判断是否已经有账号信息，有就不能取消提交
        service.get('api/accountName/getOne', {
          params: {
            accountId: this.selectRows[0].id
          }
        }).then(resp => {
          if (resp.data.length !== 0 && status === 'save') {
            this.$q.notify({
              color: 'red',
              icon: 'error',
              position: 'center',
              timeout: 1000,
              classes: 'mynotifyfont',
              message: '已有账号信息不能取消提交'
            })
          } else {
            service.get('api/account/updateStatus', { params: {
              id: this.selectRows[0].id,
              status: status
            } })
              .then(resp => {
                if (resp.code === 99999) {
                  this.$q.notify({
                    color: 'green',
                    icon: 'thumb_up',
                    position: 'center',
                    timeout: 1500,
                    message: resp.message
                  })
                  this.loadData({ pagination: this.pagination })
                  this.changeBtn(status)
                  this.accountDetail.status = status
                  this.selectRows = []
                } else {
                  this.$q.notify({
                    color: 'red',
                    icon: 'error',
                    position: 'center',
                    timeout: 1000,
                    classes: 'mynotifyfont',
                    message: resp.message
                  })
                }
              })
          }
        })
      } else if (this.selectRows.length === 0) {
        this.$q.notify({
          color: 'red',
          icon: 'error',
          position: 'center',
          timeout: 2000,
          classes: 'mynotifyfont',
          message: '请选择分录'
        })
      } else {
        this.$q.notify({
          color: 'red',
          icon: 'error',
          position: 'center',
          timeout: 2000,
          classes: 'mynotifyfont',
          message: '一次只能选择一条分录'
        })
      }
    },
    finishJob () {
      if (this.selectRows.length === 1) {
        service.get('api/accountName/getOne', {
          params: {
            accountId: this.selectRows[0].id
          }
        }).then(resp => {
          if (resp.data.length > 0) {
            this.accountDetail.id = this.selectRows[0].id
            this.accountDetail.status = this.selectRows[0].status
            this.accountFinishFormShow = true
          } else {
            if (this.$store.state.application.role === '管理员') {
              this.accountDetail.id = this.selectRows[0].id
              this.accountDetail.status = this.selectRows[0].status
              this.accountFinishFormShow = true
            } else {
              this.$q.notify({
                color: 'red',
                icon: 'error',
                position: 'center',
                timeout: 2000,
                classes: 'mynotifyfont',
                message: '还没有账号信息，请联系管理员'
              })
            }
          }
        })
      } else if (this.selectRows.length === 0) {
        this.$q.notify({
          color: 'red',
          icon: 'error',
          position: 'center',
          timeout: 2000,
          classes: 'mynotifyfont',
          message: '请选择分录'
        })
      } else {
        this.$q.notify({
          color: 'red',
          icon: 'error',
          position: 'center',
          timeout: 2000,
          classes: 'mynotifyfont',
          message: '一次只能选择一条分录'
        })
      }
    },
    closeForm () {
      this.accountFinishFormShow = false
      this.loadData({ pagination: this.pagination })
      this.selectRows = []
    },
    // 获取单个账号申请表信息，用于查看和编辑
    getAccount () {
      if (this.selectRows.length === 1) {
        service.get('api/account/edit', { params: {
          id: this.selectRows[0].id
        } })
          .then(resp => {
            Object.assign(this.formData, resp.data)
            let systemInfoArray = resp.data.systemInfo
            for (let i = 0; i < systemInfoArray.length; i++) {
              for (let s = 0; s < this.requiredSystemPermissions.length; s++) {
                if (systemInfoArray[i].name === this.requiredSystemPermissions[s].name) {
                  this.requiredSystemPermissions[s].perm = systemInfoArray[i].perm
                  this.requiredSystemPermissions[s].value = systemInfoArray[i].value
                  this.requiredSystemPermissions[s].id = systemInfoArray[i].id
                  this.requiredSystemPermissions[s].org = systemInfoArray[i].org
                }
              }
            }
            this.AccountForm = true
          })
      } else if (this.selectRows.length === 0) {
        this.$q.notify({
          color: 'red',
          icon: 'error',
          position: 'center',
          timeout: 2000,
          classes: 'mynotifyfont',
          message: '请选择分录'
        })
      } else {
        this.$q.notify({
          color: 'red',
          icon: 'error',
          position: 'center',
          timeout: 2000,
          classes: 'mynotifyfont',
          message: '一次只能选择一条分录'
        })
      }
    },
    lookup () {
      this.pagination.keyWord = this.searchWord.value
      this.loadData({ pagination: this.pagination })
    },
    monitorStatus (details) {
      const status = details.rows[0].status
      this.changeBtn(status)
    },
    changeBtn (status) {
      switch (status) {
        case 'save':
          this.invalidBtn = false
          this.editBtn = false
          this.disableReferBtn = false
          this.referBtn = false
          this.printBtn = true
          this.cancelFinishBtn = true
          this.showFinishBtn = true
          this.showInvalidBtn = true
          this.accountDetailBtn = true
          this.showUploadBtn = true
          break
        case 'submit':
          this.disableReferBtn = false
          this.invalidBtn = true
          this.showInvalidBtn = true
          this.editBtn = true
          this.referBtn = true
          this.printBtn = false
          this.cancelFinishBtn = true
          this.showFinishBtn = true
          this.accountDetailBtn = false
          this.showUploadBtn = true
          break
        case 'invalid':
          this.invalidBtn = false
          this.editBtn = true
          this.printBtn = true
          this.disableReferBtn = true
          this.cancelFinishBtn = true
          this.showFinishBtn = true
          this.showInvalidBtn = false
          break
        case 'finish':
          this.invalidBtn = true
          this.showInvalidBtn = true
          this.editBtn = true
          this.printBtn = false
          this.disableReferBtn = true
          this.cancelFinishBtn = false
          this.showFinishBtn = false
          this.accountDetailBtn = false
          this.showUploadBtn = false
      }
    },
    printPdf () {
      if (this.selectRows.length === 1) {
        service({
          url: 'api/account/print',
          method: 'get',
          params: { id: this.selectRows[0].id },
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
            }
          } else {
            let blob = new Blob([resp], { type: 'application/pdf' })
            window.open(URL.createObjectURL(blob))
          }
        })
      } else if (this.selectRows.length === 0) {
        this.$q.notify({
          color: 'red',
          icon: 'error',
          position: 'center',
          timeout: 2000,
          classes: 'mynotifyfont',
          message: '请选择要打印预览的分录'
        })
      } else {
        this.$q.notify({
          color: 'red',
          icon: 'error',
          position: 'center',
          timeout: 2000,
          classes: 'mynotifyfont',
          message: '一次只能打印预览一条分录'
        })
      }
    },
    uploadFile () {
      if (this.selectRows.length === 1) {
        if (this.selectRows[0].status === 'submit') {
          this.accountDetail.id = this.selectRows[0].id
          this.accountDetail.status = this.selectRows[0].uploadFileNum
          this.showUploadFileForm = true
        } else {
          this.$q.notify({
            color: 'red',
            icon: 'error',
            position: 'center',
            timeout: 2000,
            classes: 'mynotifyfont',
            message: '申请表还没提交无法上传'
          })
        }
      } else {
        this.$q.notify({
          color: 'red',
          icon: 'error',
          position: 'center',
          timeout: 2000,
          classes: 'mynotifyfont',
          message: '请选择要上传的申请表'
        })
      }
    },
    viewFile () {
      if (this.selectRows.length === 1) {
        service({
          url: 'api/account/viewForm',
          method: 'get',
          params: { id: this.selectRows[0].id },
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
            }
          } else {
            let blob = new Blob([resp], { type: 'application/pdf' })
            window.open(URL.createObjectURL(blob))
          }
        })
      } else if (this.selectRows.length === 0) {
        this.$q.notify({
          color: 'red',
          icon: 'error',
          position: 'center',
          timeout: 2000,
          classes: 'mynotifyfont',
          message: '请选择要查看文件的分录'
        })
      } else {
        this.$q.notify({
          color: 'red',
          icon: 'error',
          position: 'center',
          timeout: 2000,
          classes: 'mynotifyfont',
          message: '一次只能查看一条分录的文件'
        })
      }
    }
  },
  watch: {
    searchWord () {
      switch (this.searchWord.value) {
        case 'name':
          this.showFixSearch = false
          this.pagination.searchContent = ''
          break
        case 'id':
          this.showFixSearch = false
          this.pagination.searchContent = ''
          break
        case 'type':
          this.showFixSearch = true
          this.pagination.searchContent = ''
          this.FixSearchOptions = this.applicationTypeOptions
          break
        case 'branch':
          this.showFixSearch = true
          this.pagination.searchContent = ''
          this.FixSearchOptions = this.branchOptions
          break
        case 'status':
          this.showFixSearch = true
          this.pagination.searchContent = ''
          this.FixSearchOptions = [{ label: '暂存', value: 'save' }, { label: '已提交', value: 'submit' }, { label: '已完成', value: 'finish' }, { label: '作废', value: 'invalid' }]
          break
        case 'date':
          this.showFixSearch = false
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
    this.loadData({
      pagination: this.pagination,
      filter: undefined
    })
  }
}
</script>

<style lang="stylus">
.myfont {
  thead tr:first-child th {
    font-size: 18px;
    font-weight: bold;
  }
}

.mynotifyfont {
  font-size: 18px;
}

.q-field__prefix {
  color: $blue-8;
}
</style>
