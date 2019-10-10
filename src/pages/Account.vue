<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section class="q-gutter-sm">
        <div class="row q-gutter-sm">
          <q-btn color="primary" icon="open_in_new" label="查看" rounded @click="view"/>
          <q-btn color="primary" icon="add" label="新增" rounded @click="add" />
          <q-btn color="primary" icon="edit" label="编辑" rounded @click="edit" :disable="editBtn"/>
          <q-btn color="secondary" icon="done" label="完成提交" rounded @click="refer('已提交')" v-show="!referBtn" :disable="disableReferBtn"/>
          <q-btn color="secondary" icon="done" label="取消提交" rounded @click="refer('暂存')" v-show="referBtn" :disable="disableReferBtn"/>
          <q-btn color="secondary" icon="print" label="打印预览" rounded @click="printPdf" :disable="printBtn"/>
          <q-btn color="positive" icon="how_to_reg" label="任务完成" rounded @click="refer('已完成')" :disable="finishBtn" v-show="showFinishBtn" v-has-permission="'管理员'"/>
          <q-btn color="positive" icon="how_to_reg" label="取消完成" rounded @click="refer('已提交')" :disable="finishBtn" v-show="!showFinishBtn"/>
          <q-btn color="red" icon="clear" label="作废申请" rounded @click="refer('作废')" :disable="invalidBtn" v-show="showInvalidBtn"/>
          <q-btn color="red" icon="clear" label="取消作废" rounded @click="refer('暂存')" :disable="invalidBtn" v-show="!showInvalidBtn"/>
          <q-btn color="info" icon="replay" label="重载数据" rounded @click="reloadAll"/>
        </div>
        <div class="q-gutter-sm row" style="margin-right:50px;">
          <q-select outlined rounded dense bottom-slots v-model="searchWord" :options="searchOptions" style="width:120px" />
          <q-input bottom-slots v-model="pagination.searchContent" v-if="searchWord.value === 'name'" placeholder="请输入搜索内容...." style="width:250px;" dense rounded outlined>
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
             @selection="monitorStatus" @request="loadData">
    </q-table>
<!--    申请表单-->
    <q-dialog v-model="AccountForm" persistent>
      <q-card style="width:1000px;height:800px; max-width: 990px;" >
        <q-card-section>
          <div class="row">
            <div class="text-h6 text-bold">{{formTitle}}</div>
            <q-space/>
            <q-btn flat icon="close" @click="onReset"></q-btn>
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
              <q-select v-model="formData.dept" :options="branchOptions" prefix="部门/公司：" placeholder="请选择部门或者公司" style="width:220px" dense
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
          <q-card-section>
            <div class="row q-col-gutter-md">

            </div>
          </q-card-section>
          <q-separator />
          <q-card-section class="row q-gutter-sm">
            <div class="row q-gutter-sm">
              <div class="text-blue-8">{{ system1 }}：</div>
              <q-option-group v-model="formData.sysOrg1" :options="organizationOptions" color="green" type="checkbox" inline dense :disable="onlyView"></q-option-group>
            </div>
            <div class="row q-gutter-sm">
              <div class="text-blue-8">权 限：</div>
              <q-option-group v-model="formData.sysPerm1" :options="sys1PermissionOptions" color="green" type="checkbox" inline dense :disable="onlyView"></q-option-group>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-gutter-sm">
            <div class="row q-gutter-sm"  v-show="disableWithUser">
              <div class="text-blue-8">{{system2}}：</div>
              <q-option-group v-model="formData.sysOrg2" :options="organizationOptions" color="green" type="checkbox" inline dense :disable="onlyView"></q-option-group>
            </div>
            <div class="row q-gutter-sm">
              <div class="text-blue-8">{{system2}}权限：</div>
              <q-option-group v-model="formData.sysPerm2" :options="sys2PermissionOptions" color="green" type="checkbox" inline dense :disable="onlyView"></q-option-group>
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-section class="q-gutter-sm">
            <div class="row q-gutter-sm" v-show="disableWithUser">
              <div class="text-blue-8">{{ system3 }}：</div>
              <q-option-group v-model="formData.sysOrg3" :options="easBranchOptions" color="green" type="checkbox" inline dense :disable="onlyView"></q-option-group>
            </div>
            <div class="row q-gutter-sm">
              <div class="text-blue-8">{{ system3 }}权限：</div>
              <q-option-group v-model="formData.sysPerm3" :options="sys3PermissionOptions" color="green" type="checkbox" inline dense :disable="onlyView"></q-option-group>
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-section>
<!--            <div class="row q-gutter-sm">-->
<!--              <q-option-group-->
<!--                v-model="formData.permissions"-->
<!--                :options="permissionOptions"-->
<!--                color="green"-->
<!--                type="checkbox"-->
<!--                inline-->
<!--              />-->
<!--            </div>-->
            <q-input v-model="formData.otherPerm" prefix="其他权限：" placeholder="请输入需要的其他权限" style="width:700px" :disable="onlyView" dense/>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right">
            <q-btn outline dense label="提交" type="submit" color="primary" :disable="onlyView"/>
            <q-btn outline dense label="取消" color="red" type="reset"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>

</template>

<script>
import { date } from 'quasar'
import service from '../utils/request.js'
export default {
  data () {
    return {
      selectRows: [],
      pagination: {
        sortBy: 'id',
        descending: false,
        page: 1,
        rowsPerPage: 5,
        rowsNumber: 20,
        searchContent: '',
        keyWord: ''
      },
      startDate: '',
      endDate: '',
      showFinishBtn: true,
      showInvalidBtn: true,
      finishBtn: false,
      printBtn: false,
      referBtn: false,
      disableReferBtn: false,
      editBtn: false,
      invalidBtn: false,
      onlyView: false,
      disableWithUser: true,
      formTitle: '',
      submitMethod: '',
      visibleCols: ['num', 'name', 'dept', 'applicationType', 'createdBy', 'createTime', 'status'],
      columns: [
        {
          name: 'id',
          align: 'left',
          label: 'id',
          field: 'id',
          sortable: true
        },
        { name: 'num', align: 'left', label: '序号', field: 'num' },
        { name: 'name', align: 'left', label: '申请人', field: 'name' },
        { name: 'dept', align: 'left', label: '所在公司/部门', field: 'dept' },
        // { name: 'systemName', align: 'left', label: '系统名称', field: 'systemName' },
        { name: 'applicationType', align: 'left', label: '申请类型', field: 'applicationType' },
        { name: 'createdBy', align: 'left', label: '创建人', field: 'createdBy' },
        { name: 'createTime', align: 'left', label: '创建时间', field: 'createTime', format: val => date.formatDate(val, 'YYYY-MM-DD HH:mm') },
        { name: 'status', align: 'left', label: '状态', field: 'status' }
      ],
      searchWord: {
        label: '申请人',
        value: 'name'
      },
      formData: {
        name: '',
        group: '',
        dept: '',
        post: '',
        email: '',
        tel: '',
        reason: '',
        sysOrg1: [],
        sysPerm1: [],
        sysOrg2: [],
        sysPerm2: [],
        sysOrg3: [],
        sysPerm3: [],
        otherPerm: '',
        applicationType: ''
      },
      system1: '关贸云',
      system2: 'ERP',
      system3: '金蝶EAS',
      tableData: [],
      searchOptions: [{
        label: '申请人',
        value: 'name'
      }, {
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
      organizationOptions: [{ label: '物流', value: '物流' }, { label: '综合', value: '综合' }, { label: '东诚', value: '东诚' }],
      applicationTypeOptions: [],
      sys1PermissionOptions: [],
      sys2PermissionOptions: [],
      sys3PermissionOptions: [],
      // easDetailPermissionOptions: [],
      AccountForm: false,
      isShowDetailPermission: false
    }
  },
  methods: {
    loadData (props) {
      service.post('api/account/getAll', {
        rowsPerPage: props.pagination.rowsPerPage,
        rowsNumber: props.pagination.rowsNumber,
        page: props.pagination.page,
        sortBy: props.pagination.sortBy,
        searchContent: props.pagination.searchContent,
        keyWord: props.pagination.keyWord,
        startDate: this.startDate,
        endDate: this.endDate
      }).then(resp => {
        this.tableData = resp.data.data
        this.pagination.page = resp.data.page
        this.pagination.rowsPerPage = resp.data.rowsPerPage
        this.pagination.rowsNumber = resp.data.rowsNumber
      })
      service.get('/api/account/getDept').then(resp => {
        this.branchOptions = []
        this.easBranchOptions = []
        let arr = resp.data
        for (let r of arr) {
          this.branchOptions.push(r)
          this.easBranchOptions.push({ label: r, value: r })
        }
        this.formData.dept = this.branchOptions[0]
        if (arr.length === 1) {
          this.formData.sysOrg3.push(arr[0])
          this.formData.sysOrg2.push(arr[0])
          this.disableWithUser = false
        }
      }).catch(() => {
        console.log('load branch fail')
      })
      service.get('api/account/data').then(resp => {
        for (let key in resp.data) {
          if (key === 'EAS权限') {
            this.sys3PermissionOptions = resp.data[key].firstOptions
          }
          if (key === 'ERP权限') {
            this.sys2PermissionOptions = resp.data[key].firstOptions
          }
          if (key === '关贸云权限') {
            this.sys1PermissionOptions = resp.data[key].firstOptions
          }
          // if (key === '系统名称') {
          //   console.log(resp.data[key].firstOptions)
          // }
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
    },
    reloadAll () {
      this.pagination.page = 1
      this.pagination.rowsPerPage = 5
      this.pagination.rowsNumber = 10
      this.pagination.searchContent = ''
      this.pagination.keyWord = ''
      this.pagination.sortBy = 'id'
      this.loadData({ pagination: this.pagination })
    },
    subForm () {
      console.log('提交结果')
      this.formData['system1'] = this.system1
      this.formData['system2'] = this.system2
      this.formData['system3'] = this.system3
      console.log(this.formData)
      service.post('api/account', {
        formData: JSON.stringify(this.formData),
        method: this.submitMethod
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
      if (this.selectRows.length === 1) {
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
          }).catch(error => {
            console.log(error.response)
          })
      } else if (this.selectRows.length === 0) {
        this.$q.notify({
          color: 'red',
          icon: 'error',
          position: 'center',
          timeout: 2500,
          classes: 'mynotifyfont',
          message: '请选择分录'
        })
      } else {
        this.$q.notify({
          color: 'red',
          icon: 'error',
          position: 'center',
          timeout: 2500,
          classes: 'mynotifyfont',
          message: '一次只能选择一条分录'
        })
      }
    },
    getAccount () {
      if (this.selectRows.length === 1) {
        service.get('api/account/edit', { params: {
          id: this.selectRows[0].id
        } })
          .then(resp => {
            Object.assign(this.formData, resp.data)
            console.log(this.formData)
            this.AccountForm = true
          })
      } else if (this.selectRows.length === 0) {
        this.$q.notify({
          color: 'red',
          icon: 'error',
          position: 'center',
          timeout: 2500,
          classes: 'mynotifyfont',
          message: '请选择分录'
        })
      } else {
        this.$q.notify({
          color: 'red',
          icon: 'error',
          position: 'center',
          timeout: 2500,
          classes: 'mynotifyfont',
          message: '一次只能选择一条分录'
        })
      }
    },
    lookup () {
      console.log(this.pagination)
      this.pagination.keyWord = this.searchWord.value
      this.loadData({ pagination: this.pagination })
    },
    monitorStatus (details) {
      const status = details.rows[0].status
      this.changeBtn(status)
    },
    changeBtn (status) {
      switch (status) {
        case '暂存':
          this.invalidBtn = false
          this.editBtn = false
          this.disableReferBtn = false
          this.referBtn = false
          this.printBtn = true
          this.finishBtn = true
          this.showFinishBtn = true
          this.showInvalidBtn = true
          break
        case '已提交':
          this.disableReferBtn = false
          this.invalidBtn = true
          this.showInvalidBtn = true
          this.editBtn = true
          this.referBtn = true
          this.printBtn = false
          this.finishBtn = false
          this.showFinishBtn = true
          break
        case '作废':
          this.invalidBtn = false
          this.editBtn = true
          this.printBtn = true
          this.disableReferBtn = true
          this.finishBtn = true
          this.showFinishBtn = true
          this.showInvalidBtn = false
          break
        case '已完成':
          this.invalidBtn = true
          this.showInvalidBtn = true
          this.editBtn = true
          this.printBtn = false
          this.disableReferBtn = true
          this.finishBtn = false
          this.showFinishBtn = false
      }
    },
    printPdf () {
      if (this.selectRows.length === 1) {
        console.log(this.selectRows)
        service({
          url: 'api/account/print',
          method: 'get',
          params: { id: this.selectRows[0].id },
          responseType: 'blob'
        }).then(resp => {
          let _this = this
          console.log(resp.type)
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
      } else if (this.selectRows.length === 0) {
        this.$q.notify({
          color: 'red',
          icon: 'error',
          position: 'center',
          timeout: 2500,
          classes: 'mynotifyfont',
          message: '请选择要打印预览的分录'
        })
      } else {
        this.$q.notify({
          color: 'red',
          icon: 'error',
          position: 'center',
          timeout: 2500,
          classes: 'mynotifyfont',
          message: '一次只能打印预览一条分录'
        })
      }
    }
  },
  watch: {
    searchWord () {
      console.log('监控搜索关键字')
      switch (this.searchWord.value) {
        case 'name':
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
          this.FixSearchOptions = ['暂存', '已提交', '已完成', '作废']
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
