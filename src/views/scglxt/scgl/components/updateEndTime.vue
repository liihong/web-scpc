<template>
  <div class="selectPerson">
    <el-dialog
      v-if="dialogState.show"
      title="修改订单【】交货时间"
      :visible.sync="dialogState.show"
      width="30%"
    >
      <el-form style="text-align:center;">
        <el-form-item label="选择时间">
          <el-date-picker v-model="endTime" type="date" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button
            width="100%"
            size="medium"
            @click.stop="overWork"
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
  methods: {}
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
