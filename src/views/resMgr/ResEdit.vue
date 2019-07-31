<template>
  <div class="resEdit">
    <el-dialog append-to-body :modal=false :width="width" size="small" :title="optionType == 'add' ? '新增' : '编辑'" :visible.sync="dialogState.show" :close-on-click-modal="false">
      <el-form class="form" :inline="true" ref="form" :model="formData" label-width="120px" size="small">
        <el-col :span="12" v-show="item.PROPERTY_TYPE !== '10'" v-for="(item,i) in columnData" :key="i" class="item">
          <el-col :span="8" class="title">
            <span>{{item.COLUMN_CNAME}}</span>
          </el-col>
          <el-col :span="16">
            <!--主键-->
            <template v-if="item.PROPERTY_TYPE == '10'">
              <span v-show="false">{{formData[item.COLUMN_NAME]}}</span>
            </template>
            <template v-else-if="item.PROPERTY_TYPE == '2'">
              <!--下拉选择-->
              <el-select @change="$emit('selectChange',formData)" style="width:100%" clearable filterable v-model="formData[item.COLUMN_NAME]">
                <el-option v-for="(item,key) in dropDownListData[item.COLUMN_NAME]" :key="key" :label="item.NAME" :value="item.id"></el-option>
              </el-select>
            </template>
            <template v-else-if="item.PROPERTY_TYPE == '4'">
              <!--数据字典-->
              <el-select @change="$emit('selectChange',formData)" style="width:100%" v-model="formData[item.COLUMN_NAME.toLowerCase()]">
                <el-option v-for="(item,key) in dropDownListData[item.COLUMN_NAME]" :key="key" :label="item.NAME" :value="item.id"></el-option>
              </el-select>
            </template>

            <template v-else-if="item.PROPERTY_TYPE == '5'">
              <!--日期-->
              <el-date-picker value-format="yyyy-MM-dd" style="width:100%" v-model="formData[item.COLUMN_NAME]" type="date" placeholder="选择日期">
              </el-date-picker>
            </template>
            <template v-else>
              <el-input width="320" v-model="formData[(item.COLUMN_NAME)]"></el-input>
            </template>
          </el-col>
        </el-col>
      </el-form>
      <el-col :span='24' :offset="9" class="footer">
        <el-button type="primary" @click="onSave">保存</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-col>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'resEdit',
  props: ['dialogState'],
  data() {
    return {
      columnData: [],
      formData: this.dialogState.formData,
      dropDownListData: {},
      primaryKey: {}
    }
  },
  computed: {
    optionType() {
      return this.dialogState.type
    },
    tableId() {
      return this.dialogState.tableId
    },
    resId() {
      return this.dialogState.id
    },
    width() {
      if(this.columnData.length > 3) {
        return '70%'
      }else {
        return '35%'
      }
    }
  },
  mounted() {},
  methods: {
    onSave() {
      let params = {}
      let data = this.$refs['form'].model
      params.tableId = this.tableId
      params.form = {}
      Object.keys(data).map(item => {
        params.form[item.toLowerCase()] = data[item]
      })
      //编辑
      if (this.optionType == 'edit') {
        params.primaryKey = this.primaryKey
        this.$ajax.post(this.$api.editTableData, params).then(res => {
          if (res && res.data && res.data == 1) {
            this.$message.editSuccess()
            this.$emit('saveAfter', params.form)
            this.dialogState.show = false
          } else {
            this.$message.editError(res.errmsg)
          }
        })
      } else {
        // 新增
        this.$ajax.post(this.$api.addTableData, params).then(res => {
          if (res && res.errno == 0) {
            this.$message.addSuccess()
            this.$emit('saveAfter', res.data)
            this.dialogState.show = false
          } else {
            this.$message.addError(res.errmsg)
          }
        })
      }
    },
    onCancel() {
      this.dialogState.show = false
    },
    //获取表单属性配置信息
    getConfig() {
      return this.$ajax
        .get(this.$api.getTableColumns, {
          flag: 'UPDATE',
          tableId: this.tableId
        })
        .then(res => {
          if (res.data.length && res.data.length > 0) {
            this.columnData = res.data
          }
        })
    },
    // 获取表单数据，如果是编辑进行数据回填
    getFormData() {
      this.primaryKey.value = this.resId
      this.$ajax
        .get(this.$api.queryDataById, {
          tableId: this.tableId,
          id: this.resId
        })
        .then(res => {
          this.formData = res.data
        })
    },
    // 获取数据字典数据
    getSjzdData(attr, sql) {
      this.$ajax
        .get(this.$api.getDropDownListData, {
          typesql: sql
        })
        .then(res => {
          this.$set(this.dropDownListData, attr, res.data)
        })
    }
  },
  watch: {
    dialogState: {
      deep: true,
      handler() {
        if (this.dialogState.show) {
          const vm = this
          this.getConfig().then(() => {
            this.columnData.forEach(item => {
              if (item.PROPERTY_TYPE == '2' || item.PROPERTY_TYPE == '4') {
                vm.getSjzdData(item.COLUMN_NAME, item.TYPESQL)
              }
              if (item.PROPERTY_TYPE == '10') {
                this.primaryKey.name = item.COLUMN_NAME
              }
            })
          })
          if (this.optionType == 'edit') {
            this.getFormData()
          } else {
            this.$nextTick(()=>{
              this.$refs.form.resetFields()
              this.formData = {}
            })
          }
        }
      }
    }
  }
}
</script>
<style lang="scss">
.el-dialog {
  background: #f6f6f6;
  padding-bottom: 20px;
}
</style>
<style lang="scss" scoped>
.form {
  height: 100%;
  display: inline-block;
  &:after {
    content: '.';
    display: block;
    height: 0;
    clear: both;
    visibility: hidden;
  }
  .item {
    width: 45%;
    margin-top: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    .title {
      text-align: right;
      padding-right: 30px;
    }
  }
  .footer {
    margin-top: 20px;
    margin-bottom: 20px;
  }
}
</style>
