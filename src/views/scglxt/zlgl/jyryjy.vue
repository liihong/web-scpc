<template>
  <div class="ddgl">
    <DataResList @refreshData="refreshData" :tableData="checkList" tableId='010403' noEdit>
      <el-table-column slot="operate" fixed="left" label="操作" min-width="250" align="center">
        <template slot-scope="scope">
         <el-button-group>
            <el-button type="primary"  @click="changeRadio(scope.row)" class="radio" :label="1">全部通过</el-button>
            <el-button type="warning"  @click="passSection(scope.row)" class="radio" :label="2">部分通过</el-button>
            <el-button type="danger"  @click="noPass(scope.row)" class="radio" :label="3">全部返工</el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </DataResList>
    <passPart :dialogState="dialogState" />
  </div>
</template>

<script>
import DataResList from '../../resMgr/ResDataList'
import passPart from './components/passPart'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      checkList: {},
      dialogState: {
        show: false,
        type: 'part',
        row: {}
      },
      query: {
        pageSize: 30,
        pageNumber: 1
      }
    }
  },
  components: {
    DataResList,
    passPart
  },
  computed: {
    ...mapGetters(['token'])
  },
  mounted() {
    this.initData()
  },
  methods: {
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
            id: row.id,
            gygcid: row.gygcid,
            jgryid: row.jgryid,
            jyryid: this.token,
            bomid: row.bomid,
            bfjs: 0,
            serial: row.serial
          })
          .then(res => {
            if (res.errno == 0) {
              this.$message.success('操作成功！')
              this.initData()
            }
          })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.radioGroup {
  text-align: left;
}
.radio {
  margin-left: 0 !important;
  margin-right: 0 !important;
}
</style>