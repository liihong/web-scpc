<template>
  <div class="selectPerson">
    <el-dialog v-if="dialogState.show" title="设备产能调整" :visible.sync="dialogState.show" width="30%">
      <el-button type="primary">批量修改产能</el-button>
      <el-table :data="sblxList">
          <el-table-column align="center" prop="mc" label="类型名称"></el-table-column>
          <el-table-column prop="gymc" label="所属工艺"></el-table-column>
          <!-- <el-table-column prop="sbsl" label="设备数量"> -->
          <el-table-column prop="bzcn" label="标准产能">

          </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>

export default {
  props: ['dialogState'],
  data() {
    return {
      sblxList: [],
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    initData() {
      this.$ajax.post(this.$api.getSBLXList).then(res => {
        if (res.errno == 0) {
          this.sblxList = res.data
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
      this.$ajax
        .post(this.$api.beginWork, {
          worker: worker.id,
          gyid: this.dialogState.gyid
        })
        .then(res => {
          if (res.errno == 0) {
            this.$message.success('开始加工,操作成功！')
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
