<template>
  <el-dialog title="合同报价单" :visible.sync="dialogState.show" width="80%">
    <ResList ref="bjdList" tableId='0110' :query="query" @selectChange="selectChange" noAdd>
      <span v-show="noBom" style="margin:0 10px;" slot="toolBar">
        <span style="color:#48b884;margin-right:30px;">请打钩选择想要开票的零件</span>
        <el-button type="primary" @click="autoInvoice">开票</el-button>
      </span>
    </ResList>
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
    }
  },
  methods: {
    autoInvoice(){
      if (this.selectList.length > 0) {
        let bjdIds = [],bjdmcs = []
        this.selectList.map(item => {
          bjdIds.push(item.ID);
          bjdmcs.push(item.LJMC);
        })
        this.$message.confirm('是否确定开本次发票？', () => {
          this.$ajax
            .post(this.$api.addHTFP, {
              ssht: this.dialogState.query.SSHT,
              ids: bjdIds,
              names: bjdmcs
            })
            .then(res => {
              if (res && res.errno == 0) {
                this.$message.success()
                this.dialogState.show = false
                this.$parent.$refs.resList.getResList()
              } else {
                this.$message.error(res.data.errmsg)
              }
            })
        })
      } else {
        this.$message('请先勾选零件！')
      }
    },

    selectChange(sels) {
      this.selectList = sels
    }
  },
  watch: {
    'dialogState.query'() {
      this.$nextTick(() => {
        this.query = this.dialogState.query
      })
    }
  }
}
</script>
