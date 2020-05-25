<template>
  <div>
    <el-dialog
      append-to-body
      width="40%"
      size="small"
      title="标准件出库"
      :visible.sync="isOutStore.show"
      :close-on-click-modal="false"
    >
      <el-row>
        <el-form class="form" ref="rulesForm" :model="formData" label-width="120px">
          <el-row>
            <el-col :span="20">
              <el-form-item prop="LJMC" label="零件名称">
                <el-input
                  @keyup.enter.native="getBZJKC"
                  @blur="getBZJKC"
                  width="100%"
                  v-model="formData.LJMC"
                  placeholder="零件名称"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="4">
                <el-button type="primary">查询</el-button>
            </el-col>
          </el-row>
          <el-row>
            <el-table :data="tableData">
              <el-table-column label="零件名称" prop="ljmc"></el-table-column>
              <el-table-column label="零件材质" prop="ljcz"></el-table-column>
              <el-table-column label="零件规格" prop="ljgg"></el-table-column>
              <el-table-column label="零件类型" prop="ljlx"></el-table-column>
              <el-table-column label="出库数量" prop="rksl">
                <template slot-scope="scope">
                  <el-input width="100%" v-model="scope.row.rksl" placeholder="出库数量"></el-input>
                </template>
              </el-table-column>
            </el-table>
          </el-row>
          <el-col :span="24" :offset="9" class="footer">
            <el-button type="primary" @click="onSave">出库</el-button>
          </el-col>
        </el-form>
      </el-row>
    </el-dialog>
    <resEdit :dialogState="dialogState" />
  </div>
</template>

<script>
import ResEdit from "../../../resMgr/ResEdit";
export default {
  props: ["isOutStore"],
  components: {
    ResEdit
  },
  data() {
    return {
      formData: {
        LJMC: ""
      },
      tableData: [],
      dialogState: {
        show: false,
        type: "add",
        formData: {},
        tableId: '0116',
        id: ""
      }
    };
  },
  methods: {
      //入库保存
    onSave() {
        this.tableData = this.tableData.map(item=>{
            if(item.rksl){
                item.dqkc = parseInt(item.dqkc*1)-parseInt(item.rksl)
            }else{
                item.rksl = 0
            }
            return item
        })
        this.$ajax
        .post(this.$api.bzj.outStoreBzj, {
          form: this.tableData
        })
        .then(res => {
          if (res.errno == 0) {
            this.isOutStore.show = false
            this.$message.success('出库完成！')
            this.$parent.$refs.bzjgl.getResList()
          }
        });
    },
    //根据名称查询仓库中是否有该零件
    getBZJKC() {
      let vm = this;
      if (this.formData.LJMC == "") {
        return;
      }
      this.$ajax
        .post(this.$api.bzj.getBzjKCByName, {
          name: this.formData.LJMC
        })
        .then(res => {
          if (res.errno == 0) {
            if (res.data.length == 0) {
              this.$confirm(
                `仓库中未找到该零件【${vm.formData.LJMC}】,是否新增?`,
                "提示",
                {
                  confirmButtonText: "新增",
                  cancelButtonText: "取消",
                  type: "warning"
                }
              ).then(() => {
                vm.dialogState.show = true
              });
            } else {
              this.tableData = res.data;
            }
          }
        });
    }
  },
  watch:{
      'isOutStore.show'(){
          if(this.isOutStore.show){
              this.formData.LJMC = ''
              this.tableData = []
          }
      }
  }
};
</script>

<style>
</style>