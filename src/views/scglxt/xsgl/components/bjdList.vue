<template>
  <el-dialog title="合同报价单" :visible.sync="dialogState.show" width="80%">
    <ResList ref="bjdList" tableId='0110' :query="query" @selectChange="selectChange" noAdd>
      <span v-show="noBom" style="margin:0 10px;" slot="toolBar">
        <span style="color:#48b884;">请打钩选择想要生成BOM的零件信息</span>
        <el-button type="primary" @click="autoBOM">生成BOM</el-button>
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
    autoBOM() {
      if (this.selectList.length > 0) {
        let arrs = []
        this.selectList.map(item => {
          arrs.push({
            id: this.$util.getUUId(),
            zddmc: item.LJMC,
            zddcz: item.CZ,
            jgsl: item.SL,
            bmcl: '',
            gs: 0,
            ddtz: item.TH,
            ssdd: this.dialogState.query.SSDD || '',
            zddzt: '0501', //默认是未开始状态
            clzl: 0,
            bljs: item.SL,
            zddjb: '',
            bjdid: item.ID
          })
        })
        this.$message.confirm('是否确定生成BOM？', () => {
          this.$ajax
            .post(this.$api.addBomMany, {
              ssdd: this.dialogState.query.SSDD,
              ssht: this.dialogState.query.SSHT,
              form: arrs
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
    // dialogState:{
    //   deep: true,
    //   handler() {
    //     if(this.dialogState.show){
    //       this.$refs.bjdList.getConfig()
    //       this.$refs.bjdList.getResList()
    //     }else{
    //       this.$parent.destory()
    //     }
    //   }
    // }
    'dialogState.query'() {
      console.log(this.dialogState.query)
      this.$nextTick(() => {
        this.query = this.dialogState.query
      })
    }
  }
}
</script>
