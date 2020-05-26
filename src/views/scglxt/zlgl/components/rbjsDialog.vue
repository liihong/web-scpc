<template>
  <el-dialog
    title="质检让步接收"
    :visible.sync="dialogState.show"
    width="30%"
  >
    <div class="title">
      <span>
        订单号：
        <span style="color:#42b983">{{row.SSDD_TEXT}}</span>
        零件名称：
        <span style="color:#42b983">{{row.BOMID_TEXT}}</span>
      </span>
    </div>
    <div class="form">
      <el-form :model="params" :rules="rules" ref="dhForm">
        <el-form-item prop="sjzt" label="数据状态">让步接收</el-form-item>
        <el-form-item prop="dhjs" label="加工件数">
          <el-input-number v-model="params.dhjs" :min="1" label="加工件数"></el-input-number>
          <br />
        </el-form-item>
        <el-form-item prop="dhyy" label="接收意见">
          <el-input v-model="params.dhyy" />
        </el-form-item>
        <el-form-item>
          <el-button @click="passPart" class="namesBtn" type="primary">确定接收</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: {
    dialogState: {
      type: Object
    },
    isBF: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      params: {
        sjzt: "2201",
        dhjs: 0,
        dhyy: ""
      },
      rules: {
        dhjs: [{ required: true, message: "请输入加工件数", trigger: "blur" }],
        dhyy: [{ required: true, message: "请输入接收意见", trigger: "blur" }]
      }
    };
  },
  computed: {
    ...mapGetters(["token"]),
    row() {
      return this.dialogState.row;
    }
  },
  methods: {
    passPart() {
      if (this.params.dhjs > this.row.SJJS) {
        this.$message.warning("加工件数不能大于送检件数");
        return;
      }
      this.$refs["dhForm"].validate(valid => {
        if (valid) {
          this.params.id = this.row.ID;
          this.params.gygcid = this.row.gygcid;
          this.params.jyryid = this.token;
          this.params.bomid = this.row.BOMID;
          this.params.jgjs = this.row.SJJS;
          this.params.yjgjs = this.row.YJGJS;
          this.params.serial = this.row.serial;
          this.$ajax.post(this.$api.gygxCheckRBJS, this.params).then(res => {
            if (res.errno == 0) {
              this.$message.success("让步接收成功");
              this.dialogState.show = false;
              this.$parent.initData();
            }
          });
        }
      });
    }
  },
  watch: {
    dialogState: {
      deep: true,
      handler() {
        if (this.dialogState.show) {
          this.params.dhjs = this.dialogState.row.SJJS;
          this.params.sjzt = this.dialogState.sjzt;
        }
      }
    },
    isBF() {
      if (this.isBF) {
        this.params.sjzt = "2202";
      }
    }
  }
};
</script>

<style>
</style>
