<template>
  <div class="resEdit">
    <el-dialog append-to-body :modal=false width="50%" size="small" :title="optionList[optionType] + '订单'" :visible.sync="dialogState.show" :close-on-click-modal="false">
      <el-form class="form" :rules="rules" ref="rulesForm" :model="formData" label-width="120px">
        <el-col :span="12">
          <el-form-item prop="SSHT" label="所属合同">
            <el-select @change="changeSSHT" filterable v-model="formData.SSHT" placeholder="所属合同">
              <el-option v-for="(item,key) in dropDownListData['ssht']" :key="key" :label="item.NAME" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="XMNAME" label="项目名称">
            <el-input v-model="formData.XMNAME" placeholder="项目名称"></el-input>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item prop="STARTTIME" label="开始时间">
            <el-date-picker value-format="yyyy-MM-dd" v-model="formData.STARTTIME" type="date" placeholder="开始时间">
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="ENDTIME" label="结束时间">
            <el-date-picker value-format="yyyy-MM-dd" v-model="formData.ENDTIME" type="date" placeholder="结束时间">
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="XMFZR" label="项目负责人">
            <el-input v-model="formData.XMFZR" placeholder="项目负责人"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="XMLXR" label="项目联系人">
            <el-input  v-model="formData.XMLXR" placeholder="项目联系人"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="DDLEVEL" label="订单级别">
            <el-radio-group v-model="formData.DDLEVEL">
              <el-radio-button label="0403">普通</el-radio-button>
              <el-radio-button label="0402">重要</el-radio-button>
              <el-radio-button label="0401">紧急</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="TZ" label="图纸">
            <el-input-number :controls=false v-model="formData.JGSL" :min="1" label="加工数量"></el-input-number>
          </el-form-item>
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
      optionList: {
        add: '新增',
        edit: '编辑',
        copy: '复制'
      },
      rules: {
        XMNAME: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
        SSHT: [{ required: true, message: '请选择所属合同', trigger: 'blur' }]
      },
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
      if (this.columnData.length > 3) {
        return '70%'
      } else {
        return '35%'
      }
    }
  },
  mounted() {
    this.$set(this.formData,'DDLEVEL', '0403')
    this.getSjzdData(
      'ssht',
      'SELECT id,htbh NAME,htjc FROM scglxt_t_ht'
    )
  },
  methods: {
    async changeSSHT(val) {
      let arr = this.dropDownListData['ssht'].filter(item=>{
        return item.id == val
      })
      let ddbh = await this.$ajax.post(this.$api.getNewDDbh)
      this.formData.XMNAME = (arr[0].htjc).toUpperCase() + '-' + ddbh.data
    },
    onSave() {
      let params = {}
      let data = this.$refs['rulesForm'].model
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
      this.$parent.$refs.ddList.getResList()
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
            this.$nextTick(() => {
              this.$refs.rulesForm.resetFields()
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
