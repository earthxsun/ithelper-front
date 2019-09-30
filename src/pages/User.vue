<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section class="q-gutter-sm">
        <!-- <q-btn color="primary" icon="open_in_new" label="查看" size="md" rounded /> -->
        <q-btn color="primary"
               icon="add"
               label="新增"
               rounded
               @click="addUser" />
        <q-btn color="primary"
               icon="edit"
               label="编辑"
               rounded
               @click="editUser" />
        <!-- <q-btn color="red" :icon="onofficon" :label="onofflabel" rounded /> -->
        <div class="absolute-right q-gutter-sm row"
             style="margin-right:50px;margin-bottom:10px">
          <q-select outlined
                    bottom-slots
                    dense
                    v-model="searchValue"
                    :options="searchOptions"
                    style="width:120px" />
          <q-input bottom-slots v-if="searchValue.value === 'username'" v-model="searchContent"
                   placeholder="请输入搜索内容...."
                   style="width:250px;"
                   dense
                   outlined>
            <template v-slot:after>
              <q-btn outline icon="search" color="green" label="查询" @click="lookup"/>
            </template>
          </q-input>
          <q-select bottom-slots outlined dense style="width:250px" v-if="searchValue.value !== 'username'" v-model="FixSearchContent" :options="FixSearchOptions">
            <template v-slot:after>
              <q-btn  outline icon="search" color="green" label="查询"  @click="FixLookup"/>
            </template>
          </q-select>
        </div>
      </q-card-section>
    </q-card>

    <br />

    <q-table class="myfont"
             :data="data"
             :columns="columns"
             row-key="id"
             :pagination.sync="pagination"
             :visible-columns="myCols"
             selection="multiple"
             :selected.sync="selectRows"
             @request="loadData">

    </q-table>

<!--    <div class="q-mt-md">-->
<!--      Selected: {{ JSON.stringify(selectRows) }}-->
<!--    </div>-->
    <q-dialog v-model="userForm"
              persistent>

      <q-card style="width:400px;height:650px; max-width: 400px;">
        <q-toolbar class="bg-blue text-white shadow-2 rounded-borders">
          <div class="text-h6"
               v-if="methods==='add'">新增用户</div>
          <div class="text-h6"
               v-if="methods==='edit'">编辑用户</div>
        </q-toolbar>

        <q-separator />
        <q-form @submit="onSubmit"
                @reset="onReset">
          <q-card-section>
            <div class="q-col-gutter-lg">
              <q-input v-model="username"
                       prefix="用户名："
                       placeholder="请输入用户名"
                       :rules="[val => !!val || '用户名不能为空']"
                       :disable="isEdit"></q-input>
              <q-input v-model="password"
                       :type="isPwd ? 'password' : 'text'"
                       prefix="密码："
                       :hint="passwordHint"
                       placeholder="请输入密码"
                       :rules="[ val => val.length === 0 || val.length >5 || '密码至少6位字符']">
                <template v-slot:append>
                  <q-icon :name="isPwd ? 'visibility_off' : 'visibility'"
                          class="cursor-pointer"
                          @click="isPwd = !isPwd" />
                </template>
              </q-input>
              <q-select v-model="userStatus"
                        :options="status"
                        prefix="状态："
                        hint="请选择状态" />

              <q-select v-model="roleselect"
                        :options="roles"
                        prefix="角色："
                        hint="请选择角色"
                        :rules="[val => !!val || '角色不能为空']" />
              <q-select v-model="deptselect"
                        :options="depts"
                        prefix="部门/公司："
                        hint="请选择部门或者公司"
                        :rules="[val => !!val || '部门/公司不能为空']" />
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn outline
                   label="保存"
                   color="primary"
                   type="submit" />
            <q-btn outline
                   label="取消"
                   color="primary"
                   type="reset" />
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
      columns: [
        {
          name: 'id',
          align: 'left',
          label: 'userid',
          field: 'id',
          sortable: true
        },
        {
          name: 'num',
          align: 'left',
          label: '序号',
          field: 'num'
        },
        {
          name: 'username',
          align: 'left',
          label: '用户名',
          field: 'username'
        },
        {
          name: 'roleName',
          align: 'left',
          label: '角色',
          field: 'roleName'
        },
        {
          name: 'deptName',
          align: 'left',
          label: '部门/公司',
          field: 'deptName'
        },
        {
          name: 'status',
          align: 'left',
          label: '状态',
          field: 'status',
          format: val => (val === '1' ? '启用' : '禁用')
        },
        {
          name: 'createdBy',
          align: 'left',
          label: '创建人',
          field: 'createdBy'
        },
        {
          name: 'createTime',
          align: 'left',
          label: '创建时间',
          field: 'createTime',
          format: val => date.formatDate(val, 'YYYY-MM-DD HH:mm')
        },
        {
          name: 'updatedBy',
          align: 'left',
          label: '更新人',
          field: 'updatedBy'
        },
        {
          name: 'updateTime',
          align: 'left',
          label: '更新时间',
          field: 'updateTime',
          format: val => date.formatDate(val, 'YYYY-MM-DD HH:mm')
        }
      ],
      userStatus: '启用',
      status: ['启用', '禁用'],
      onofficon: '',
      onofflabel: '',
      passwordHint: '',
      isEdit: false,
      methods: '',
      username: '',
      password: '',
      isPwd: true,
      searchValue: { label: '用户名',
        value: 'username' },
      searchOptions: [{
        label: '用户名',
        value: 'username'
      }, {
        label: '角色',
        value: 'role'
      }, {
        label: '部门/公司',
        value: 'branch'
      }, {
        label: '状态',
        value: 'status'
      }],
      searchContent: '',
      FixSearchContent: '',
      FixSearchOptions: [],
      deptselect: '',
      roleselect: '',
      userId: '',
      selectRows: [],
      data: [],
      depts: [],
      roles: [],
      myCols: [
        'num',
        'username',
        'roleName',
        'deptName',
        'status',
        'createdBy',
        'createTime',
        'updatedBy',
        'updateTime'
      ],
      pagination: {
        sortBy: 'id',
        descending: false,
        page: 1,
        rowsPerPage: 5,
        rowsNumber: 20,
        filter: { value: 'all' },
        keyWord: ''
      },
      userForm: false
    }
  },
  watch: {
    searchValue () {
      if (this.searchValue.value === 'role') {
        this.FixSearchContent = ''
        this.FixSearchOptions = this.roles
      }
      if (this.searchValue.value === 'branch') {
        this.FixSearchContent = ''
        this.FixSearchOptions = this.depts
      }
      if (this.searchValue.value === 'status') {
        this.FixSearchContent = ''
        this.FixSearchOptions = ['启用', '禁用']
      }
    }
  },
  methods: {
    loadData (props) {
      service
        .post('/api/user/getUsers', {
          rowsPerPage: props.pagination.rowsPerPage,
          rowsNumber: props.pagination.rowsNumber,
          page: props.pagination.page,
          sortBy: props.pagination.sortBy,
          filter: props.pagination.filter.value,
          keyWord: props.pagination.keyWord
        })
        .then(resp => {
          console.log(resp)
          this.data = resp.data.data
          this.pagination.page = resp.data.page
          this.pagination.rowsPerPage = resp.data.rowsPerPage
          this.pagination.rowsNumber = resp.data.rowsNumber
        })
    },
    addUser () {
      this.methods = 'add'
      this.userForm = true
      this.passwordHint = '留空等于设置密码为123456'
    },
    editUser () {
      if (this.selectRows.length === 1) {
        console.log(this.selectRows[0].id)
        service
          .put('/api/user', {
            id: this.selectRows[0].id
          })
          .then(resp => {
            console.log(resp)
            this.methods = 'edit'
            this.userId = resp.data.id
            this.username = resp.data.username
            this.roleselect = resp.data.roleName
            this.deptselect = resp.data.deptName
            this.userStatus = resp.data.status === '1' ? '启用' : '禁用'
            this.passwordHint = '留空等于不修改密码'
            this.isEdit = true
            this.userForm = true
          })
      } else if (this.selectRows.length > 1) {
        this.$q.notify({
          color: 'red',
          icon: 'error',
          position: 'center',
          timeout: 2500,
          classes: 'mynotifyfont',
          message: '一次只能编辑一个用户'
        })
      } else {
        this.$q.notify({
          color: 'red',
          icon: 'error',
          position: 'center',
          timeout: 2500,
          classes: 'mynotifyfont',
          message: '请选择要编辑的用户'
        })
      }
    },
    branchData () {
      service
        .get('/api/dept')
        .then(resp => {
          let arr = resp.data
          for (let r of arr) {
            this.depts.push(r.deptName)
          }
        })
        .catch(() => {
          console.log('load branch fail')
        })
    },
    roleData () {
      service
        .get('/api/role')
        .then(resp => {
          let arr = resp.data
          for (let r of arr) {
            this.roles.push(r.roleName)
          }
        })
        .catch(() => {
          console.log('load role fail')
        })
    },
    onSubmit () {
      service
        .post('/api/user', {
          username: this.username,
          password: this.password,
          role: this.roleselect,
          dept: this.deptselect,
          id: this.userId,
          status: this.userStatus === '启用' ? '1' : '0',
          methods: this.methods,
          creator: this.$store.state.application.username,
          Modifier: this.$store.state.application.username
        })
        .then(resp => {
          if (resp.code === 99999) {
            this.$q.notify({
              color: 'blue',
              icon: 'thumb_up',
              position: 'center',
              timeout: 3000,
              message: resp.message
            })
          } else {
            this.$q.notify({
              color: 'red',
              icon: 'error',
              position: 'center',
              timeout: 2500,
              classes: 'mynotifyfont',
              message: resp.message
            })
          }
          console.log('保存后重置')
          this.onReset()
        })
        .catch(resp => {
          console.log(resp)
          this.onReset()
        })
    },
    lookup () {
      this.pagination.filter = this.searchValue
      this.pagination.keyWord = this.searchContent
      this.loadData({
        pagination: this.pagination,
        filter: undefined
      })
    },
    FixLookup () {
      this.pagination.filter = this.searchValue
      this.pagination.keyWord = this.FixSearchContent
      this.loadData({
        pagination: this.pagination,
        filter: undefined
      })
    },
    onReset () {
      console.log('关闭')
      this.isEdit = false
      this.userForm = false
      this.username = ''
      this.password = ''
      this.roleselect = ''
      this.deptselect = ''
      this.methods = ''
      this.loadData({
        pagination: this.pagination,
        filter: undefined
      })
    }
  },
  mounted () {
    this.roleData()
    this.loadData({
      pagination: this.pagination,
      filter: undefined
    })
    this.branchData()
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
