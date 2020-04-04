<template>
  <div>
    <ResList tableId='0101' ref="htgl" @saveAfter="addDd" :query="this.$route.query" noEdit>
      <el-table-column slot="operate" fixed="left" label="操作" min-width="250" align="center">
        <template slot-scope="scope">
          <el-button-group size="mini" v-if="token!='201609101108000012'">
            <el-button size="mini" @click="bjdClickLook(scope.row)" type="primary">报价单</el-button>
            <el-button size="mini" @click="spClick(scope.row)" type="success">审批</el-button>
          </el-button-group>
          <el-button-group size="mini" v-else>
            <el-button size="mini" @click="bjdClickLook(scope.row)" type="primary">报价单</el-button>
            <el-button size="mini" @click="bjdClick(scope.row)" type="primary">上传</el-button>
            <el-button size="mini" @click="$refs.htgl.handleEdit(scope.row)" type="primary">编辑</el-button>
            <el-button size="mini" @click="handleDelete(scope.row)" type="danger">删除</el-button>
          </el-button-group>
        </template>
      </el-table-column>
      <template slot="KHID" slot-scope="scope">
        <router-link style="color:#48b884;" :to="{path: 'khxxgl', query: {SSHT: scope.row.ID}}">{{scope.row.KHID_TEXT}}</router-link>
      </template>
      <template slot="HTBH" slot-scope="scope">
        <router-link style="color:#48b884;" :to="{path: 'ddgl', query: {SSHT: scope.row.ID}}">{{scope.row.HTBH}}</router-link>
      </template>
    </ResList>
    <bjd :dialogState="dialogState"></bjd>
    <bjdList :dialogState="bjdState" />
    <htsp :dialogState="spState" />

  </div>
</template>

<script>
import bjdList from '../xsgl/components/bjdList'
import bjd from './components/bjd'
import htsp from './components/htsp.vue'

export default {
  components: {
    bjd,
    bjdList,
    htsp
  },
  data() {
    return {
      dialogState: {
        show: false,
        row: {}
      },
      bjdState: {
        show: false,
        query: {}
      },
      spState: {
        show: false,
        row: {}
      }
    }
  },
  computed:{
    token(){
      return ''
    }
  },
  methods: {
    spClick(row) {
      this.spState.row = row
      this.spState.show = true
    },
    bjdClick(row) {
      this.dialogState.row = row
      this.dialogState.show = true
      // this.$router.push({ path: 'bjd', query: { SSHT: row.ID } })
    },
    // 查看报价单
    bjdClickLook(row) {
      let ssht = row.ID
      this.bjdState.query = { SSHT: ssht }
      this.bjdState.show = true
    },
    // 删除合同时，先删除该合同下的订单，订单下的bom信息再删除合同
    handleDelete(row) {
      this.$message.confirm(
        '删除合同会同时删除合同的订单和BOM信息请谨慎',
        () => {
          this.$ajax
            .post(this.$api.deleteDd, {
              ssht: row['ID']
            })
            .then(res => {
              if (res && res.errno == 0) {
                this.$message.deleteSuccess('删除订单信息成功！')
                this.$refs.htgl.handleDelete(row, false)
              } else {
                this.$message.deleteError(res.data.errmsg)
              }
            })
        }
      )
    },
    // 增加合同后自动增加一条订单信息
    async addDd(htInfo) {
    let ddbh = await this.$ajax.post(this.$api.getNewDDbh)
     
      let ddData = {
        ssht: htInfo.data.id,
        xmname:
          '2020-' + htInfo.data.htjc +
          '-' +
          ddbh.data,
        ddlevel: '0403',
        starttime: htInfo.data.kssj,
        endtime: htInfo.data.jssj,
        xmfzr: '李勇',
        xmlxr: '李勇',
        dqjd: 0,
        zgs: 0
      }

      let params = {}
      params.tableId = '0102' //订单tableId
      params.form = ddData
      this.$ajax.post(this.$api.addTableData, params).then(res => {
        if (res && res.errno == 0) {
          this.$message.addSuccess(
            '合同：【' + htInfo.data.htbh + '】生成了一条新订单。'
          )
        } else {
          this.$message.addError(res.errmsg)
        }
      })
    }
  }
}
</script>
