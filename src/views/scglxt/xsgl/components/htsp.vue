<template>
  <el-dialog :title="`【${dialogState.row.HTBH}】合同审批`" :visible.sync="dialogState.show" width="20%">
    <el-form style="text-align:center"  label-position="top">
      <el-form-item label="审批状态">
        <el-radio-group v-model="form.spzt">
          <el-radio :label="1">通过</el-radio>
          <el-radio :label="0">驳回</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="驳回理由" v-if="form.spzt==0">
        <el-input v-model="form.bhly"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSaveClick">保存</el-button>
        <el-button type="info" @click="dialogState.show = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script>
export default {
  props: {
    dialogState: {
      type: Object
    }
  },
  data() {
    return {
      form: {
        spzt: 1,
        bhly: ""
      }
    };
  },
  methods: {
    onSaveClick() {
      this.form.htid = this.dialogState.row.ID;
      this.form.htbh = this.dialogState.row.HTBH;

      this.$ajax.post(this.$api.ht_sptg, this.form).then(res => {
        if (res && res.errno == 0) {
          this.$message.success("合同审批成功");
          this.dialogState.show = false;
          this.$parent.num++
        }
      });
    }
  },
  watch: {}
};
</script>
