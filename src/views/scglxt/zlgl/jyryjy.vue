<template>
  <div class="ddgl">
    <div class="tool_desc">提示：点击零件名称查看加工记录</div>
    <DataResList @refreshData="refreshData" @selectChange="getChecks" :tableData="checkList" tableId='010403' noEdit noAdd>
      <el-form-item slot="toolBar">
        <el-button type="primary" icon="el-icon-s-unfold" @click="passMany"  :label="1">批量通过</el-button>
      </el-form-item>
      <el-table-column slot="operate" fixed="left" label="操作" width="250" align="center">
        <template slot-scope="scope">
          <el-button-group>
            <el-button type="primary" @click="changeRadio(scope.row)" class="radio" :label="1">通过</el-button>
            <el-button type="warning" @click="passSection(scope.row)" class="radio" :label="2">部分通过</el-button>
            <el-button type="danger" @click="noPass(scope.row)" class="radio" :label="3">返工</el-button>
          </el-button-group>
        </template>
      </el-table-column>
       <template slot="DQJD" slot-scope="scope">
        <div style="text-align:left;" v-html="scope.row.DQJD"></div>
      </template>
      <template slot="BOMID" slot-scope="scope">
        <a @click="openJgjl(scope.row.BOMID)" style="text-align:left;" v-html="scope.row.BOMID_TEXT"></a>
      </template>
    </DataResList>
    <passPart :dialogState="dialogState" />
    <jgjlDialog :dialogState="dialogJgjl" />
  </div>
</template>

<script>
import DataResList from '../../resMgr/ResDataList'
import passPart from './components/passPart'
import jgjlDialog from './components/jgjlDialog'

import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      checkList: {},
      dialogJgjl:{
        show: false,
        query:{}
      },
      dialogState: {
        show: false,
        type: 'part',
        row: {}
      },
      selectRows: [],
      query: {
        pageSize: 30,
        pageNumber: 1
      }
    }
  },
  components: {
    DataResList,
    passPart,
    jgjlDialog
  },
  computed: {
    ...mapGetters(['token'])
  },
  activated() {
    this.initData()
  },
  mounted() {
    this.initData()
  },
  methods: {
    openJgjl(bomid){
      this.dialogJgjl.query = {BOMID:bomid}
      this.dialogJgjl.show = true
    },
    async initData() {
      let res = await this.$ajax.post(this.$api.getCheckList, this.query)
      if (res.errno == 0) {
        this.checkList = res.data
      }
    },
    refreshData(params) {
      this.query = params
      this.initData()
    },
    getChecks(sel) {
      this.selectRows = sel
    },
    passMany() {
      const vm = this
      console.log(this.selectRows)
      this.$message.confirm('是否确定检验通过当前选中行', () => {
        let arr = []
        this.selectRows.map(item => {
          arr.push(
            this.$ajax.post(this.$api.gygxCheckPassAll, {
              id: item.ID,
              gygcid: item.gygcid,
              jgryid: item.JGRYID,
              jyryid: this.token,
              bomid: item.BOMID,
              bfjs: 0,
              serial: item.serial
            })
          )
        })
        if (arr.length > 0) {
          Promise.all(arr).then(function() {
            vm.$message.success('批量操作成功！')
            vm.initData()
          })
        }
      })
    },
    //部分通过
    passSection(row) {
      this.dialogState.type = 'part'
      this.dialogState.row = row
      this.dialogState.show = true
    },
    noPass(row) {
      this.dialogState.row = row
      this.dialogState.show = true
      this.dialogState.type = 'noPass'
    },
    changeRadio(row) {
      this.$message.confirm('是否确定全部检验通过', () => {
        this.$ajax
          .post(this.$api.gygxCheckPassAll, {
            id: row.ID,
            gygcid: row.gygcid,
            jgryid: row.JGRYID,
            jyryid: this.token,
            bomid: row.BOMID,
            bfjs: 0,
            serial: row.serial
          })
          .then(res => {
            if (res.errno == 0) {
              this.$message.success('操作成功！')
              this.initData()
              setTimeout(() => {
                this.$socket.emit('getTableData', res => {
                  console.log(res)
                  console.log('发送通知更新数据')
                },0)
              })
            }
          })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.tool_desc{
  position: absolute;
  left: 600px;
  top:20px;
  color:red;
}
.radioGroup {
  text-align: left;
}
.radio {
  margin-left: 0 !important;
  margin-right: 0 !important;
}
</style>