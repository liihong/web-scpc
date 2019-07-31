<template>
    <div>
        <ResList tableId='010405' ref="gylcgl" noEdit>
            <el-table-column slot="operate" fixed="left" label="操作" min-width="150" align="center">
                <template slot-scope="scope">
                    <el-button-group size="mini">
                        <el-button size="mini" type="primary" @click="setJGgy(scope.row)">工艺</el-button>
                        <el-button size="mini" type="primary" @click="$refs.gylcgl.handleEdit(scope.row)">编辑</el-button>
                        <el-button size="mini" type="danger" @click="$refs.gylcgl.handleDelete(scope.row)">删除</el-button>
                    </el-button-group>
                </template>
            </el-table-column>
        </ResList>
        <gybzDialog :dialogState="dialogState" />
    </div>
</template>

<script>
import gybzDialog from './components/editGyBz'

export default {
  components: {
    gybzDialog
  },
  data() {
    return {
      dialogState: {
        show: false,
        type: 'edit'
      }
    }
  },
  methods: {
    setJGgy(row) {
      this.dialogState.show = true
      this.dialogState.row = row
    }
  }
}
</script>

<style>
</style>
