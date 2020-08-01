<template>
    <div class="ddgl">
        <ResList tableId='010402' :query="this.$route.query" noEdit ref="blList">
            <template slot="CLZT" slot-scope="scope">
                <div>
                    <el-radio-group v-model="scope.row.CLZT" class="radioGroup">
                        <el-radio @change="changeRadio(scope.row)" class="radio" :label="1">完成备料</el-radio>
                        <el-radio v-show="scope.row.CLZT !=0 && scope.row.CLZT !=2" @change="changeRadio(scope.row)" class="radio" :label="2">自备料</el-radio>
                        <el-radio v-show="scope.row.CLZT !=2 && scope.row.CLZT !=0" @change="changeRadio(scope.row)" class="radio" :label="0">待采购</el-radio>
                    </el-radio-group>
                    <span v-show="scope.row.CLZT != '' || scope.row.CLZT != null" style="color:red;">{{clztData[scope.row.CLZT]}}</span>
                </div>
            </template>
        </ResList>
    </div>
</template>

<script>
export default {
  name: 'bomgl',
  components: {},
  data() {
    return {
      radioValue: '',
      clztData: {
        0: '待采购',
        1: '完成备料',
        2: '自备料'
      }
    }
  },
  methods: {
    changeRadio(row) {
        this.$ajax
          .post(this.$api.updateBLZT, {
            id: row.ID,
            clzt: row.CLZT,
            cgry: this.$store.getters.token
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
  color: #48b884 !important;
  margin-left: 0 !important;
}
</style>
