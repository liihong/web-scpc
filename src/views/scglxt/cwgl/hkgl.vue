<template>
    <div class="lxrgl">
      <ResList tableId='0121' noEdit>
        <el-table-column slot="operate" fixed="left" label="操作" align="center">
            <template slot-scope="scope">
              <el-button-group size="mini">
                <el-button size="mini" @click="rowClickLook(scope.row)" type="primary">回款</el-button>
              </el-button-group>
            </template>
        </el-table-column>
      </ResList>
      <addRefund :dialogState="refundState" />
    </div>
  </template>
  
  <script>
  import addRefund from "./components/addRefund";
  export default {
    components:{
      addRefund,
    },
    data(){
      return{
        refundState: {
          show: false,
          row: {}
        },
      }
    },
    methods:{
      rowClickLook(row){
        this.refundState.show = true;
        this.refundState.row = row
      }
    }
  }
  </script>
  