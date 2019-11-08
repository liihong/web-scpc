<template>
  <div class="ddgl">
    <ResList key="0102" tableId='0102' :query="this.$route.query" noEdit ref="ddList">
      <el-table-column slot="operate" fixed="left" label="操作" min-width="180" align="center">
        <template slot-scope="scope">
          <el-button-group size="mini">
            <el-button @click="exportBL(scope.row.ID)" size="mini" type="primary">备料</el-button>
            <el-button @click="exportDD(scope.row.ID)" size="mini" type="primary">导出</el-button>
            <el-button @click="uploadTZ(scope.row)" size="mini" type="primary">图纸</el-button>
            <el-button size="mini" type="primary" @click="copyRow(scope.row)">复制</el-button>
            <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="primary" @click="handleDelete(scope.row)">删除</el-button>
          </el-button-group>
        </template>
      </el-table-column>
      <template slot="SSHT" slot-scope="scope">
        <router-link style="color:#48b884;" :to="{path: 'htgl', query: {ID: scope.row.SSHT}}">{{scope.row.SSHT_TEXT}}</router-link>
      </template>
      <template slot="XMNAME" slot-scope="scope">
        <router-link style="color:#48b884;" :to="{path: 'bomgl', query: {SSDD: scope.row.ID}}">{{scope.row.XMNAME}}</router-link>
      </template>
      <template slot="DDLEVEL" slot-scope="scope">
        <el-tag effect='dark' :type="scope.row.DDLEVEL == '0402' ? 'warning' : scope.row.DDLEVEL == '0403' ? '' : 'danger'">{{scope.row.DDLEVEL_TEXT}}</el-tag>
      </template>
      <template slot="DQJD" slot-scope="scope">
        <el-progress :text-inside="true" :stroke-width="14" :percentage="getBFB(scope.row.DQJD,scope.row.ZGS)"></el-progress>
      </template>
    </ResList>
    <uploadTZ :dialogState="dialogState" />
    <editDD :dialogState="ddForm" />
  </div>
</template>

<script>
import { EXPORT_DDBL, EXPORT_DDBOM } from '@/api/scglxt/oldAPI.js'
import uploadTZ from './components/uploadTz'
import editDD from './components/editDD'

export default {
  name: 'ddgl',
  components: {
    uploadTZ,
    editDD
  },
  data() {
    return {
      dialogState: {
        row: {},
        show: false
      },
      ddForm: {
        show: false,
        type: 'add',
        tableId: '0102',
        id: '',
        formData: {
          ID: this.$util.getUUId(),
          SSHT: this.$route.query.SSHT || '',
          DDLEVEL: '0403'
        }
      }
    }
  },
  methods: {
    //新增事件处理
    handleAdd() {
      this.ddForm.type = 'add'
      this.ddForm.id = this.$util.getUUId()
      this.ddForm.show = true
    },
    handleEdit(row) {
      this.ddForm.type = 'edit'
      this.ddForm.id = row.ID
      this.ddForm.show = true
      this.ddForm.formData = row
    },
    //复制订单
    copyRow(row) {
      this.$message.confirm('复制订单,并复制该订单下工艺?', () => {
        this.$ajax
          .post(this.$api.copyDd, {
            id: row['ID']
          })
          .then(res => {
            if (res && res.errno == 0) {
              this.$message.success('成功复制订单和工艺！')
              this.$refs.ddList.getResList()
            } else {
              this.$message.error(res.data.errmsg)
            }
          })
      })
    },
    handleDelete(row) {
      this.$message.confirm('删除订单并删除该订单下所有工艺?', () => {
        this.$ajax
          .post(this.$api.deleteDd, {
            id: row['ID']
          })
          .then(res => {
            if (res && res.data == 1) {
              this.$message.deleteSuccess('删除订单信息成功！')
              this.$refs.ddList.getResList()
            } else {
              this.$message.deleteError(res.data.errmsg)
            }
          })
      })
    },
    exportDD(ddId) {
      location.href = EXPORT_DDBOM + '?ddid=' + ddId
      // this.$ajax.getBolb(this.$api.exportDdBOM, {id: ddId}).then(res => {
      //   if (res.data) {
      //     let url = URL.createObjectURL(res.data)
      //     let fileName = res.headers['content-disposition'].split('=')[1]
      //     fileName = decodeURI(fileName)
      //     let link = document.createElement('a')
      //     link.style.display = 'none'
      //     link.href = url
      //     link.setAttribute('id', 'downloadLink')
      //     link.setAttribute('download', fileName)
      //     document.body.appendChild(link)
      //     link.click()
      //     // 删除添加的a链接
      //     let objLink = document.getElementById('downloadLink')
      //     document.body.removeChild(objLink)
      //   }
      // })
    },
    exportBL(ddId) {
      location.href = EXPORT_DDBL + '?ddid=' + ddId
    },
    // 上传图纸
    uploadTZ(row) {
      this.dialogState.row = row
      this.dialogState.show = true
    },
    //获取订单百分比
    getBFB(dqjd = 0, zgs = 0) {
      let ddzgs = zgs || 0
      let yjggs = dqjd || 0
      if (yjggs*1 == 0) {
        return 0
      }
      if (ddzgs*1 == 0) {
        return 0
      }
      let bfb = (yjggs / ddzgs) * 100

      return Math.ceil(bfb)
    }
  }
}
</script>
