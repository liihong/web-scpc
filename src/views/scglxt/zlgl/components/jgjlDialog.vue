<template>
  <el-dialog v-if="dialogState.show" title="零件加工记录" :visible.sync="dialogState.show" width="80%">
    <ResList ref="bjdList" tableId="0109" :query="dialogState.query" noAdd noEdit></ResList>
  </el-dialog>
</template>
<script>
export default {
  props: {
    dialogState: {
      type: Object
    },
    noBom: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      selectList: [],
      query: {}
    };
  },
  methods: {
    selectChange(sels) {
      this.selectList = sels;
    }
  },
  watch: {
    dialogState: {
      deep: true,
      handler() {
        if (this.dialogState.show) {
          this.$nextTick(() => {
            this.query = this.dialogState.query;
            this.$refs.bjdList.getConfig();
            this.$refs.bjdList.getResList();
          });
        }
      }
    }
  }
};
</script>
