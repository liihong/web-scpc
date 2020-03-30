<template>
  <div class="bykc">
    <el-dialog
      append-to-body
      width="50%"
      size="small"
      title="当前零件备用库存"
      :visible.sync="dialogState.show"
      :close-on-click-modal="false"
    >
      <el-table :data="tableData">
        <el-table-column prop="zddmc" label="零件名称"></el-table-column>
        <el-table-column prop="jgsl" label="当前库存"></el-table-column>
        <el-table-column prop="sykc" label="使用数量">
          <template slot-scope="scope">
            <el-input @input="change($event)" v-model="dialogState.sysl"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="button" label="操作">
          <template>
            <el-button @click="setPYKC" type="primary">关联</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "bykc",
  props: ["dialogState", "data"],
  data() {
    return {
      sysl: 0
    };
  },
  computed: {
    tableData() {
      return this.dialogState.data;
    }
  },
  mounted() {
  },
  methods: {
    change() {
      this.$forceUpdate();
    },
    setPYKC() {
      this.dialogState.isAdd = true
      this.dialogState.show = false
    }
  },
  watch: {}
};
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
