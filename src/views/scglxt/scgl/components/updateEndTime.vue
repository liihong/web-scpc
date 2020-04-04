<template>
  <div class="selectPerson">
    <el-dialog
      v-if="dialogState.show"
      :title="`修改订单【${dialogState.row.xmname}】交货时间`"
      :visible.sync="dialogState.show"
      width="25%"
    >
      <el-form style="text-align:center;">
        <el-form-item label="现交货日期">
          <span>{{dialogState.row.endtime}}</span>
        </el-form-item>
        <el-form-item label="选择日期">
          <el-date-picker v-model="dialogState.row.endtime" value-format="yyyy-MM-dd" type="date" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button
            width="100%"
            size="medium"
            @click.stop="updateEndTime"
            class="namesBtn"
            type="primary"
          >确认修改</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  components: {},
  props: ["dialogState"],
  data() {
    return {
        endTime:''
    };
  },
  mounted() {},
  methods: {
    updateEndTime(){
      this.$ajax.post(this.$api.updateEndTime,{
        ddid:this.dialogState.row.id,
        endTime:this.dialogState.row.endtime
      }).then(res => {
        if (res.errno == 0) {
          this.$message('修改交货日期成功！')
          this.dialogState.show = false
          this.$parent.getSjzdData()
        }
      })
    }
  }
};
</script>

<style lang="scss" >
.selectPerson {
  .names {
    margin-top: 20px;
    .namesBtn {
      margin: 5px;
    }
  }
}
</style>
