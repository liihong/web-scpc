<template>
  <div class="bzgl">
    <ResList ref="bzgl" tableId='0106' noEdit>
       <el-table-column slot="operate" fixed="left" label="操作" min-width="120" align="center">
        <template slot-scope="scope">
          <el-button-group size="mini">
            <el-button size="mini" @click="setRole(scope.row)" type="primary">设置权限</el-button>
            <el-button size="mini" @click="$refs.bzgl.handleEdit(scope.row)" type="primary">编辑</el-button>
            <el-button size="mini" @click="$refs.bzgl.handleDelete(scope.row)" type="danger">删除</el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </ResList>
    <roleDialog :dialogState="dialogState" />
  </div>
</template>

<script>
import roleDialog from './components/roleDialog'
export default {
  components:{
    roleDialog
  },
  data(){
    return {
      dialogState:{
        show: false,
        ssbz: ''
      }
    }
  },
  methods:{
    setRole(row){
      this.dialogState.ssbz = row.ID
      this.dialogState.show = true
    }
  }
}
</script>
