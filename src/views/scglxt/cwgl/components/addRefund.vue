<template>
  <div>
    <el-dialog
      append-to-body
      :modal="false"
      width="40%"
      size="small"
      title="合同回款"
      :visible.sync="dialogState.show"
      :close-on-click-modal="false"
      @close="$emit('isShow', false)"
    >
      <el-form
        class="form"
        ref="rulesForm"
        :model="formData"
        label-width="120px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item prop="fkzt" label="回款状态">
              <el-select filterable v-model="formData.fkzt" placeholder="结清">
                <el-option
                  v-for="(item, key) in dropDownListData"
                  :key="key"
                  :label="item.name"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-input
              style="width: 88%"
              placeholder="回款金额"
              v-model="formData.jkje"
            ></el-input>
          </el-col>
          <el-col :span="4" :offset="20">
            <el-button type="primary" @click="saveRefund">确定</el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    dialogState: {
      type: Boolean,
    },
  },
  data() {
    return {
      data: [],
      showDialog: false,
      formData: {
        htid: "",
        fkzt: "3201",
        jkje: 0,
      },
      dropDownListData: [
        {
          id: "3201",
          name: "部分",
        },
        {
          id: "3202",
          name: "结清",
        },
        {
          id: "3203",
          name: "其它",
        },
      ],
      selectData: [],
    };
  },
  async mounted() {
   
  },
  methods: {
    async saveRefund() {
      this.$ajax.post(this.$api.addRefund, this.formData).then((res) => {
        if (res && res.errno == 0) {
          this.$message.success();
          this.dialogState.show = false;
          this.$parent.$refs.resList.getResList();
        } else {
          this.$message.error(res.data.errmsg);
        }
      });
    },
  },
  watch: {
    dialogState: {
      deep: true,
      async handler() {
        if (this.dialogState.show) {
          this.formData.htid = this.dialogState.row.ID
        }
      },
    },
  },
};
</script>

<style></style>
