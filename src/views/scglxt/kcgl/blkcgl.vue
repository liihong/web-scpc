<template>
  <div class="blkcgl">
     <ResList tableId='010404' :query="this.$route.query" noEdit noAdd ref="blList">
      <template slot="CLZT" slot-scope="scope">
        <el-radio-group v-model="scope.row.CLZT" class="radioGroup">
          <el-radio @change="changeRadio(scope.row)" class="radio" :label="1">完成备料</el-radio>
          <el-radio v-show="scope.row.CLZT !=0 && scope.row.CLZT !=2" @change="changeRadio(scope.row)" class="radio" :label="2">自备料</el-radio>
          <el-radio v-show="scope.row.CLZT !=2 && scope.row.CLZT !=0" @change="changeRadio(scope.row)" class="radio" :label="0">待采购</el-radio>
        </el-radio-group>
        <span @click="cgClick(scope.row)" v-show="scope.row.CLZT != '' || scope.row.CLZT != null" class="spanText">{{clztData[scope.row.CLZT]}}</span>
      </template>
      <template slot="SSDD" slot-scope="scope">
        <el-badge  v-show="!!scope.row.ZDDJB" :value="scope.row.ZDDJB == '0402' ? '重要' : scope.row.ZDDJB == '0403' ? '' : '紧急'" class="item" :type="scope.row.ZDDJB == '0402' ? 'warning' : scope.row.ZDDJB == '0403' ? 'info' : 'danger'">
          <span style="margin:0 5px;">{{scope.row.SSDD_TEXT}}</span>
        </el-badge>
      </template>
    </ResList> 
    <cgjy :dialogState="dialogState" />
  </div>
</template>

<script>
import cgjy from './components/cgjy'
export default {
  name: 'blkcgl',
  components: {
    cgjy
  },
  data() {
    return {
      tableId: '010404',
      tableHeight: 600,
      radioValue: '',
      clztData: {
        0: '待采购',
        1: '完成备料',
        2: '自备料'
      },
      dialogState: {
        show: false,
        row: {}
      },
      tableData: []
    }
  },
  mounted(){
    var offsetHeight = window.innerHeight
    this.tableHeight = offsetHeight - 220
    this.initData()
  },
  methods: {
    initData() {
      // getBLlist
      this.$ajax.get(this.$api.getBLlist).then(res => {
        if (res.errno == 0) {
          this.tableData = res.data
        }
      })
    },
    //点击待采购
    cgClick(row) {
      if (row.CLZT == '0') {
        this.dialogState.show = true
        this.dialogState.row = row
      }
    },
    changeRadio(row) {
      this.$ajax
        .post(this.$api.updateBLZT, {
          id: row.ID,
          clzt: row.CLZT
        })
        .then(res => {
          if (res.errno == 0) {
            this.$message.success('更新备料状态成功！')
            this.$refs.blList.getResList()
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
