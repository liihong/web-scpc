<template>
  <el-dialog v-if="dialogShow" title="更新日志" :visible.sync="dialogShow" width="80%">
    <ResList ref="bjdList" tableId="0502" noAdd noEdit>
      <template style="text-align:left;" slot="desc" slot-scope="scope">
        <span
          style="text-align:left;"
          v-html="scope.row.desc"
        ></span>
      </template>
    </ResList>
  </el-dialog>
</template>
<script>
export default {
  props: {
    dialogShow: {
      type: Boolean
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
    dialogShow() {
      if (this.dialogShow) {
        this.$nextTick(() => {
          this.$refs.bjdList.getConfig();
          this.$refs.bjdList.getResList();
        });
      }
    }
  }
};
</script>
