<template>
  <div class="userManage">
    <dataTable :columnDatas="columnDatas" :tableDatas="tableDatas">
      <el-row slot-scope="scope" slot="isenabled">
        <el-switch v-model="scope.row.isenabled" @change='enabledChange(scope.row.id)'>
        </el-switch>
      </el-row>
    </dataTable>
  </div>
</template>

<script>
import services from '@/api/user'
import dataTable from '@/components/Table/dataTable'
export default {
  name: 'userManage',
  components: {
    dataTable
  },
  data() {
    return {
      loading: false,
      columnDatas: [
        {
          name: '用户名',
          id: 'username'
        },
        {
          name: '真实姓名',
          id: 'name',
          length: 60
        },
        {
          name: '所属角色',
          id: 'roles',
          length: 60
        },
        {
          name: '所属机构',
          id: 'org',
          length: 60
        },
        {
          name: '手机号码',
          id: 'phone',
          length: 60
        },
        {
          name: '是否启用',
          id: 'isenabled',
          slot: 'isenabled',
          length: 60
        }
      ],
      tableDatas: [],
      multipleSelection: [],
      green: { color: '#13CE66' },
      red: { color: '#FF4949' }
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 获取数据列表
    getList() {
      services.getUserList().then(res => {
        if (res.data && res.errno == 0) {
          this.tableDatas = res.data
        }
      })
    },
    // 改变该用户是否启用
    enabledChange(){
      // console.log(val)
    },
    editUserInfo(index, rows) {
      let rowData = rows[index]
      let newRowData = Object.assign({}, rowData)
      newRowData.group = rows[index].group._id
      this.$store.dispatch('showAdminUserForm', {
        edit: true,
        formData: newRowData
      })
    },
    deleteUser(index, rows) {
      this.$confirm(
        this.$t('adminUser.scr_del_ask'),
        this.$t('main.scr_modal_title'),
        {
          confirmButtonText: this.$t('main.confirmBtnText'),
          cancelButtonText: this.$t('main.cancelBtnText'),
          type: 'warning'
        }
      )
        .then(() => {
          return services.deleteUser({
            ids: rows[index]._id
          })
        })
        .then(result => {
          if (result.data.status === 200) {
            this.$store.dispatch('getAdminUserList')
            this.$message({
              message: this.$t('main.scr_modal_del_succes_info'),
              type: 'success'
            })
          } else {
            this.$message.error(result.data.message)
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('main.scr_modal_del_error_info')
          })
        })
    }
  }
}
</script>

