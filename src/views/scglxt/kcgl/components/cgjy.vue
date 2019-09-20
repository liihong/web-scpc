<template>
    <div class="cgjy">
        <el-dialog append-to-body :modal=false width="50%" size="small" title="填写采购建议" :visible.sync="dialogState.show" :close-on-click-modal="false">
            <el-row>
                <el-row>
                    <el-col>
                        <div class="line">
                            订单名称：
                            <span class="spanText">{{row.SSDD_TEXT}}</span>
                            零件名称：
                            <span class="spanText">{{row.ZDDMC}}</span>
                            材料名称：
                            <span class="spanText">{{row.ZDDCZ_TEXT}}</span>
                        </div>
                    </el-col>
                    <el-col>
                        <div class="line">
                            材料大小：
                            <span class="spanText">{{row.CLDX}}</span>
                            材料体积：
                            <span class="spanText">{{row.CLTJ}}</span>
                            备料件数：
                            <span class="spanText">{{row.BLJS}}</span>
                        </div>
                    </el-col>
                </el-row>
                <el-form class="form" :rules="rules" ref="rulesForm" :model="formData" label-width="120px">
                    <el-col>
                        <el-form-item prop="CGSJ" label="采购建议">
                            <el-input width="100%" type="textarea" :rows="2" v-model="formData.CGSJ" placeholder="采购建议"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span='24' :offset="9" class="footer">
                        <el-button type="primary" @click="onSave">保存</el-button>
                        <el-button @click="onCancel">取消</el-button>
                    </el-col>
                </el-form>

            </el-row>
        </el-dialog>
    </div>
</template>
<script>
export default {
  name: 'cgjy',
  props: ['dialogState'],
  data() {
    return {
      formData: {},
      rules: {
        CGSJ: [{ required: true, message: '请填写采购建议', trigger: 'blur' }]
      }
    }
  },
  computed: {
    row() {
      return this.dialogState.row
    }
  },
  mounted() {},
  methods: {
    onSave() {
      this.$refs['rulesForm'].validate(valid => {
        if (valid) {
          this.$ajax
        .post(this.$api.updateBLZT, {
          id: this.dialogState.row.ID,
          clzt: '0',
          cgyj: this.formData.CGSJ
        })
        .then(res => {
          if (res.errno == 0) {
            this.$message.success('更新备料状态成功！')
            this.$parent.initData()
          }
        })
        }
      })
    },
    onCancel() {
      this.dialogState.show = false
    }
  },
  watch: {
    dialogState: {
      deep: true,
      handler() {
        if(this.dialogState.show) {
          if(this.dialogState.row.CGSJ !='') {
            this.formData.CGSJ = this.dialogState.row.CGSJ
          }
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.cgjy {
  .line {
    margin: 10px;
    .spanText {
      margin: 0 20px;
    }
  }
}
</style>
