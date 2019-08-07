<template>
    <div class="selectPerson">
        <el-dialog title="结束工作" :visible.sync="dialogState.show" width="30%">
            <el-form style="text-align:center;">
                <el-form-item label="选择设备">
                    <el-select v-model="activeSb" placeholder="请选择">
                        <el-option v-for="item in sbList" :key="item.id" :label="item.sbmc" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="完成件数：">
                    <el-input-number v-model="jgjs" :min="1" label="描述文字"></el-input-number><br/>
                </el-form-item>
                <el-form-item>
                    <el-button @click="overWork" class="namesBtn" type="primary">完成加工</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: ['dialogState'],
  data() {
    return {
      activeSb: '',
      sbList: [],
      peopleList: [],
      jgjs: 0
    }
  },
  computed: {
    ...mapGetters(['roles'])
  },
  mounted() {
    this.initData()
  },
  methods: {
    initData() {
      this.$ajax.post(this.$api.getSbList).then(res => {
        if (res.errno == 0) {
          this.sbList = res.data
          this.sbList = this.sbList.filter(item => {
            return (item.BZID == this.roles[0])
          })
          if(this.sbList.length>0) {
            this.activeSb = this.sbList[0].id
          }
        }
      })
    },
    overWork() {
      if(this.jgjs > this.dialogState.kjgjs) {
        this.$message({
          message: '完成件数不能大于可加工件数！',
          type: 'warning'
        })
        return
      }
      this.$ajax
        .post(this.$api.overWork, {
          worker: this.dialogState.worker,
          gyid: this.dialogState.gyid,
          jgjs: this.jgjs,
          sbid: this.activeSb
        })
        .then(res => {
          if (res.errno == 0) {
            this.$message.success('结束加工,操作成功！')
            this.dialogState.show = false
            this.$parent.$refs.jgList.getResList()
          }
        })
    }
  }
}
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
