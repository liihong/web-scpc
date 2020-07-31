<template>
  <div class="resEdit">
    <el-dialog append-to-body  :width="width" size="small" :title="optionType == 'add' ? '新增' : '编辑'" :visible.sync="dialogState.show" :close-on-click-modal="false">
      <el-form class="form" :rules="rules" :inline="true" ref="form" :model="formData" label-width="120px" label-position="right" size="small">
        <el-row>
          <el-col :span="12" v-show="item.PROPERTY_TYPE !== '10'" v-for="(item,i) in columnData" :key="i" class="item">
            <el-form-item :label="item.COLUMN_CNAME" :prop="item.COLUMN_NAME" style="width:100%">
              <!--主键-->
              <template v-if="item.PROPERTY_TYPE == '10'">
                <span v-show="false">{{formData[item.COLUMN_NAME]}}</span>
              </template>
              <template style="width:100%" v-else-if="item.PROPERTY_TYPE == '2'">
                <!--下拉选择-->
                <el-select @change="$emit('selectChange',formData)" style="width:100%" clearable filterable v-model="formData[item.COLUMN_NAME]">
                  <el-option v-for="(item,key) in dropDownListData[item.COLUMN_NAME]" :key="key" :label="item.NAME" :value="item.id"></el-option>
                </el-select>
              </template>
              <template style="width:100%" v-else-if="item.PROPERTY_TYPE == '4'">
                <!--数据字典-->
                <el-select @change="$emit('selectChange',formData)" style="width:100%" v-model="formData[item.COLUMN_NAME.toLowerCase()]">
                  <el-option v-for="(item,key) in dropDownListData[item.COLUMN_NAME]" :key="key" :label="item.NAME" :value="item.id"></el-option>
                </el-select>
              </template>

              <template style="width:100%" v-else-if="item.PROPERTY_TYPE == '5'">
                <!--日期-->
                <el-date-picker value-format="yyyy-MM-dd" style="width:100%" v-model="formData[item.COLUMN_NAME]" type="date" placeholder="选择日期">
                </el-date-picker>
              </template>
              <template style="width:100%" v-else-if="item.PROPERTY_TYPE == '13'">
                <!--附件上传-->
                <el-upload class="upload-demo" :data="queryData" :on-preview="onPreview" :on-remove="onFileRemove" show-file-list :auto-upload="false" ref="upload" action="/api/util/uploadFile" :file-list="dropDownListData[item.COLUMN_NAME]">
                  <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                </el-upload>
              </template>
              <template style="width:100%" v-else-if="item.PROPERTY_TYPE == '6'">
                <!--文本域-->
               <el-input  type="textarea"  width="width:100%" v-model="formData[(item.COLUMN_NAME)]"></el-input>
              </template>
              <template style="width:100%" v-else>
                <el-input width="width:100%" v-model="formData[(item.COLUMN_NAME)]"></el-input>
              </template>
              <!-- </el-col> -->
            </el-form-item>
          </el-col>
        </el-row>
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
      primaryKey: {},
      queryData: {},
      isUpload: false,
      rules:{}
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
        return '60%'
      } else {
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
            if (this.$refs['upload']) {
              this.queryData.query = this.primaryKey['value']
              this.$refs.upload[0].submit()
            }
            params.type = 'edit'
            params.data = params.form

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
            if (this.$refs['upload']) {
              this.queryData.query = res.data['id']
              this.$refs.upload[0].submit()
            }
            res.type='add'
            this.$emit('saveAfter', res)
            this.dialogState.show = false
          } else {
            this.$message.addError(res.errmsg)
          }
        })
      }
    },
    //点击已上传的附件使其直接下载
    onPreview(file) {
      let link = document.createElement('a')
      link.style.display = 'none'
      link.href = file.url
      link.setAttribute('id', 'downloadLink')
      link.setAttribute('download', file.name)
      document.body.appendChild(link)
      link.click()
      // 删除添加的a链接
      let objLink = document.getElementById('downloadLink')
      document.body.removeChild(objLink)
    },
    // 删除文件
    onFileRemove(file) {
      this.queryData.id = file.id
      this.$ajax
        .post(this.$api.DeleteForeingDataById, this.queryData)
        .then(() => {
          this.$message.success('删除文件成功')
        })
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
          this.queryData.query = this.primaryKey['value']
          if(this.queryData.column_name) {
            this.getForeingKeyData(this.tableId, this.queryData.column_name)
          }
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
    },
    // 根据tableId,column_name 获取配置返回外键表数据
    getForeingKeyData(tableId, column_name) {
      this.$ajax
        .get(this.$api.getForeingKeyListData, this.queryData)
        .then(res => {
          this.$set(this.dropDownListData, column_name, res.data)
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
              // 如果是字典字段需要翻译
              if (item.PROPERTY_TYPE == '2' || item.PROPERTY_TYPE == '4') {
                vm.getSjzdData(item.COLUMN_NAME, item.TYPESQL)
              }
              // 如果是外表关联字段，则需要查询外表数据
              if (item.PROPERTY_TYPE == '13') {
                vm.isUpload = true
                vm.queryData = {
                  tableId: this.tableId,
                  column_name: item.COLUMN_NAME,
                  type: item.COLUMN_NAME
                }
              }
              if (item.PROPERTY_TYPE == '10') {
                this.primaryKey.name = item.COLUMN_NAME
              }
              if(item.ISMUST == '1') {
                // this.rules[item.COLUMN_NAME] = [{ required: true, message: `请输入${item.COLUMN_CNAME}`, trigger: 'blur' }]
                this.$set(this.rules,item.COLUMN_NAME,[{ required: true, message: `请输入${item.COLUMN_CNAME}`, trigger: 'blur' }])
              }
            })
          })
          if (this.optionType == 'edit') {
            this.getFormData()
          } else {
            this.$nextTick(() => {
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
    // width: 45%;
    display: flex;
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
