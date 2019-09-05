<template>
    <div>
        <el-dialog v-if="dialogState.show" append-to-body :modal=false width="40%" size="small" title="设置权限" :visible.sync="dialogState.show" :close-on-click-modal="false">
            <el-button type="primary" @click="saveRoles">保存设置</el-button>
            <el-tree check-strictly ref="tree" :data="data" show-checkbox node-key="resId" :default-checked-keys="selectData" :props="defaultProps">
            </el-tree>
        </el-dialog>
    </div>
</template>

<script>
import services from '@/api/resource'
import { formatTreeData } from '@/utils'

export default {
  props: {
    dialogState: {
      type: Object
    }
  },
  data() {
    return {
      data: [],
      defaultProps: {
        children: 'children',
        label: 'resName'
      },
      selectData: []
    }
  },
  async mounted() {},
  methods: {
    async initData() {
      let roles = await services.getResByRoleId({
        id: this.dialogState.ssbz
      })
      if (roles.errno == 0) {
        let arr = []
        roles.data.map(item => {
          arr.push(item.resId)
        })
        this.selectData = arr
      }

      let res = await services.getTreeList()
      if (res.errno == 0) {
        this.data = formatTreeData(res.data, 'resId', 'parentId')
      }
    },
    async saveRoles() {
      let arrRes = this.$refs.tree.getCheckedKeys().concat(this.$refs.tree.getHalfCheckedKeys())
      let res = await services.saveRoleRes({
          roleId: this.dialogState.ssbz,
          res: arrRes
      })
      if (res.errno == 0) {
        this.$message.success('权限修改成功')
      }
    }
  },
  watch: {
    dialogState: {
      deep: true,
      async handler() {
        if (this.dialogState.show) {
          this.initData()
        }
      }
    }
  }
}
</script>

<style>
</style>
