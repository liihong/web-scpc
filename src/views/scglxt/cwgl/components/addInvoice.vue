<template>
  <div>
    <el-dialog
      append-to-body
      :modal="false"
      width="40%"
      size="small"
      title="开发票"
      :visible.sync="showDialog"
      :close-on-click-modal="false"
      @close="$emit('isShow', false)"
    >
      <el-form
        class="form"
        ref="rulesForm"
        :model="formData"
        label-width="120px"
      >
        <el-col :span="12">
          <el-form-item prop="ZDDMC" label="选择合同">
            <el-input
              v-model="formData.ZDDMC"
              placeholder="选择合同"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          
        </el-col>
      </el-form>
      <el-button type="primary" @click="saveRoles">确定</el-button>
    </el-dialog>
  </div>
</template>

<script>
import services from "@/api/resource";
import { formatTreeData } from "@/utils";

export default {
  props: {
    isShow: {
      type: Boolean,
    },
  },
  data() {
    return {
      data: [],
      showDialog: false,
      formData: {
        children: "children",
        label: "resName",
      },
      selectData: [],
    };
  },
  async mounted() {},
  methods: {
    async initData() {
      let roles = await services.getResByRoleId({
        id: this.dialogState.ssbz,
      });
      if (roles.errno == 0) {
        let arr = [];
        roles.data.map((item) => {
          arr.push(item.resId);
        });
        this.selectData = arr;
      }

      let res = await services.getTreeList();
      if (res.errno == 0) {
        this.data = formatTreeData(res.data, "resId", "parentId");
      }
    },
    async saveRoles() {
      let arrRes = this.$refs.tree
        .getCheckedKeys()
        .concat(this.$refs.tree.getHalfCheckedKeys());
      let res = await services.saveRoleRes({
        roleId: this.dialogState.ssbz,
        res: arrRes,
      });
      if (res.errno == 0) {
        this.$message.success("权限修改成功");
      }
    },
  },
  watch: {
    dialogState: {
      deep: true,
      async handler() {
        if (this.dialogState.show) {
          this.initData();
        }
      },
    },
  },
};
</script>

<style></style>
