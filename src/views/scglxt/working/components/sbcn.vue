<template>
  <div class="selectPerson">
    <el-dialog v-if="dialogState.show" title="设备产能调整" :visible.sync="dialogState.show" width="30%">
      <el-button style="float:right;" @click="updateClick" type="primary">{{isUpdate?'保存':'批量修改产能'}}</el-button>
      <el-table :data="sblxList">
          <el-table-column align="center" prop="mc" label="类型名称"></el-table-column>
          <el-table-column prop="gymc" label="所属工艺"></el-table-column>
          <!-- <el-table-column prop="sbsl" label="设备数量"> -->
          <el-table-column prop="bzcn" label="标准产能(小时)">
            <template  slot-scope="scope">
              <span v-if="!isUpdate">{{scope.row['bzcn']}}</span>
              <el-input v-else style="width:80px" v-model="scope.row['bzcn']" ></el-input>
            </template>
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
      isUpdate: false
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
    //修改按钮
    updateClick(){
      if(this.isUpdate){//保存
        this.isUpdate = false
        this.$ajax
        .post(this.$api.updateSblxInfo, this.sblxList)
        .then(res => {
          if (res.errno == 0) {
            this.dialogState.show = false
          }
        })
      }else{
        this.isUpdate = true
      }
    },
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
