<template>
  <div class="ddgl">
    <DataResList :tableData="checkList" tableId='010403' noEdit>
      <el-table-column slot="operate" fixed="left" label="操作" min-width="300" align="center">
        <template slot-scope="scope">
          <el-radio-group v-model="scope.row.SFJY" class="radioGroup">
            <el-radio @change="changeRadio(scope.row)" class="radio" :label="1">全部通过</el-radio>
            <el-radio @change="passSection(scope.row)" class="radio" :label="2">部分通过</el-radio>
            <el-radio @change="changeRadio(scope.row)" class="radio" :label="3">全部返工</el-radio>
          </el-radio-group>
        </template>
      </el-table-column>
    </DataResList>
    <passPart :dialogState="dialogState"/>
  </div>
</template>

<script>
import DataResList from '../../resMgr/ResDataList'
import passPart from './components/passPart'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      checkList: [],
      dialogState:{
        show: false,
        row: {}
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
      let res = await this.$ajax.post(this.$api.getCheckList)
      if (res.errno == 0) {
        this.checkList = res.data
      }
    },
    //部分通过
    passSection(row){
      this.dialogState.row = row
      this.dialogState.show = true
    },
    changeRadio(row) {
     
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
            this.$message.success('全部通过成功！')
            this.initData()
          }
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