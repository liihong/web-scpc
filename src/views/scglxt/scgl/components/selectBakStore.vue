<template>
  <el-dialog title="手动备用库存出库"
             width="30%"
             :visible.sync="dialogState.show"
             close-on-click-modal
             close-on-press-escape>
    <el-form>
      <el-form-item label="关联备用库存">
        <el-select v-model="activeItem"
                   filterable
                   placeholder="请选择" value-key="id">
          <el-option v-for="item in bykList"
                     :key="item.id"
                     :label="item.zddmc"
                     :value="item">
                      <span style="float: left">{{ item.zddmc }}</span>
      <span style="float: right; color: #8492a6; font-size: 13px">{{ item.jgsl }}</span>
      </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="备用库件数">
        {{activeItem.jgsl}}
      </el-form-item>
      <el-form-item label="出库数量">
        <el-input v-model="cksl"  />
      </el-form-item>
      <el-form-item>
        <el-button @click="onSubmit"
                   type="primary">关联备用库</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
export default {
  props:{
    dialogState:{
      type: Object,
      default:()=>{
        return {
          show: false,
        }
      }
    }
  },
  data () {
    return {
      bykList: [],
      activeItem: {},
      cksl: 0,
    }
  },
  async mounted(){
    
    await this.initData()
  },
  methods: {
    async initData () {
      this.cksl = this.dialogState.row.JGSL
      await this.$ajax
        .post(this.$api.getBykcList, {
          pageSize: 1000,
          pageNumber: 1
        })
        .then(res => {
          if (res.errno == 0) {
            this.bykList = res.data;
            console.log(this.dialogState.row.BOMID_TEXT)
            const bom = res.data.find(item=>{
              return item.zddmc === this.dialogState.row.BOMID_TEXT
            })
            this.activeItem = bom
          }
        });
    },
    onSubmit(){
      this.$ajax
          .post(this.$api.beginWork, {
            worker: '201609101108000028',
            gyid: this.dialogState.row.ID
          })
        this.$ajax
        .post(this.$api.overWork, {
          worker: '201609101108000028',
          gyid: this.dialogState.row.ID,
          jgjs: this.cksl,
          ddjs: this.cksl,
          sbid: '',
          gynr: '201909111019399817'
        })

       this.$ajax
        .post(this.$api.setBOMBykc, {
          bomid: this.dialogState.row.BOMID,
          bykcid: this.activeItem.id,
          sysl: this.cksl
        })
        .then(res => {
          if (res.errno == 0) {
            this.$message.success("关联成功");
            this.dialogState.show = false
            this.$parent.$refs.jgList.getResList()
            this.$socket.emit('getTableData')
          }
        });
        
    }
  }
}
</script>

<style>
</style>