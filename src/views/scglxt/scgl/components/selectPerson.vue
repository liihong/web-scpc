<template>
  <div class="selectPerson">
    <el-dialog title="选择人员" :visible.sync="dialogState.show" width="30%">
      <el-select @change="changeBz" v-model="activeBz" placeholder="请选择">
        <el-option v-for="item in bzList" :key="item.id" :label="item.bzmc" :value="item.id">
        </el-option>
      </el-select>
      <div class="names">
        <el-button :disabled="isDisable" @click="beginWork(item)" class="namesBtn" type="primary" v-for="(item,i) in peopleList" :key="i">{{item.rymc}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: ['dialogState'],
  data() {
    return {
      activeBz: '',
      bzList: [],
      peopleList: [],
      isDisable:false
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
      this.$ajax.post(this.$api.getBzList).then(res => {
        if (res.errno == 0) {
          this.bzList = res.data
          this.activeBz = this.roles[0]
          this.changeBz(this.activeBz)
        }
      })
    },
    changeBz(val) {
      this.$ajax
        .post(this.$api.getPeopleByBz, {
          bzid: val
        })
        .then(res => {
          if (res.errno == 0) {
            this.peopleList = res.data
          }
        })
    },
    beginWork(worker) {
       this.isDisable=true
       setTimeout(()=>{
           this.isDisable=false   //点击一次时隔两秒后才能再次点击
       },5000)
      this.dialogState.show = false
       
      this.$ajax
        .post(this.$api.beginWork, {
          worker: worker.id,
          gyid: this.dialogState.gyid
        })
        .then(res => {
          if (res.errno == 0) {
            this.$message.success('开始加工,操作成功！')
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
