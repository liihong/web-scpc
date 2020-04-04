<template>
  <div class="selectPerson">
    <el-dialog
      v-if="dialogState.show"
      :title="`订单【${dialogState.row.xmname}】增加标注`"
      :visible.sync="dialogState.show"
      width="25%"
    >
      <el-form style="text-align:center;">
        <el-form-item label="标注">
          <el-input v-model="remark" />
        </el-form-item>
        <el-form-item>
          <el-button
            width="100%"
            size="medium"
            @click.stop="addRemark"
            class="namesBtn"
            type="primary"
          >保存</el-button>
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
        remark:''
    };
  },
  mounted() {
  },
  methods: {
    addRemark(){
      this.$ajax.post(this.$api.setDdMark,{
        id:this.dialogState.row.id,
        mark:this.remark
      }).then(res => {
        if (res.errno == 0) {
          this.$message.success('标注标记成功')
          this.dialogState.show = false
          this.$parent.getSjzdData()
        }
      })
    },
    initData(){
        this.$ajax.post(this.$api.getDdMark,{
        id:this.dialogState.row.id
      }).then(res => {
        if (res.errno == 0) {
          this.remark = res.data.mark
        }
      })
    }
  },
  watch:{
      'dialogState.show'(){
          if(this.dialogState.show){
              this.initData()
          }
      }
  }
};
</script>

<style lang="scss" >
</style>
