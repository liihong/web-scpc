<template>
  <div class="selectPerson">
    <el-dialog v-if="dialogState.show" title="结束工作" :visible.sync="dialogState.show" width="30%">
      <el-form style="text-align:center;">
        <el-form-item label="选择设备">
          <el-select v-model="activeSb" placeholder="请选择">
            <el-option v-for="item in sbList" :key="item.id" :label="item.sbmc" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="完成件数：">
          <el-input-number @focus.stop="showInput" v-model="jgjs" label="完成件数"></el-input-number><br/>
          <!-- <el-input @click.stop="null" @focus.stop="showInput" v-model="jgjs"></el-input> -->
        </el-form-item>
        <el-form-item>
          <el-button width="100%" size="medium" @click.stop="overWork" class="namesBtn" type="primary">完成加工</el-button>
        </el-form-item>
      </el-form>
      <number-keyboard v-model="isShowAmountKeyboard" @delete="deleteJGjs" @keyDown="withdrawAmountInput"></number-keyboard>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import NumberKeyboard from '@/components/Keyboard/number-keyboard.vue'
export default {
  components: {
    NumberKeyboard
  },
  props: ['dialogState'],
  data() {
    return {
      activeSb: '',
      sbList: [],
      peopleList: [],
      jgjs: 0,
      isShowAmountKeyboard: false
    }
  },
  computed: {
    ...mapGetters(['roles'])
  },
  mounted() {
    this.isShowAmountKeyboard = false
  },
  methods: {
    showInput() {
      this.isShowAmountKeyboard = true
    },
    withdrawAmountInput(val) {
      this.jgjs = this.jgjs + '' + val + ''
    },
    deleteJGjs() {
      let temp = this.jgjs.toString()
      temp = temp.substring(0, temp.length - 1)
      this.jgjs = temp
    },
    initData() {
      this.$ajax.post(this.$api.getSbList).then(res => {
        if (res.errno == 0) {
          let arr = res.data
          this.sbList = arr.filter(item => {
            return item.BZID == this.roles[0]
          })
          if (this.sbList.length > 0) {
            this.activeSb = this.sbList[0].id
          }
        }
      })
    },
    overWork() {
      if (this.jgjs == undefined || this.jgjs == null) {
        this.$message({
          message: '完成件数不能为空！',
          type: 'warning'
        })
        return
      }
      if (!!this.jgjs && this.jgjs == 0) {
        this.$message({
          message: '完成件数不能为0！',
          type: 'warning'
        })
        return
      }
      if (this.jgjs > this.dialogState.kjgjs) {
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
          ddjs: this.dialogState.ddjs,
          kjgjs: this.dialogState.kjgjs,
          jgjs: this.jgjs,
          sbid: this.activeSb,
          gynr: this.dialogState.gynr
        })
        .then(res => {
          if (res.errno == 0) {
            this.$message.success('结束加工,操作成功！')
            this.dialogState.show = false
            this.$parent.$refs.jgList.getResList()
            this.$socket.emit('getTableData')
          }
        })
    }
  },
  watch: {
    'dialogState.show'() {
      if (this.dialogState.show) {
        this.jgjs = this.dialogState.kjgjs
        this.initData()
      }
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
