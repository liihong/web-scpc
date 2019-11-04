<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-form :inline="true">
        <el-form-item v-show="!noAdd">
          <el-button size="mini" @click="handleAdd" type="primary" icon="el-icon-circle-plus">新增</el-button>
        </el-form-item>
        <el-form-item v-show="!noAdd">
          <el-button size="mini" @click="handleExport" type="primary" icon="el-icon-download">导出</el-button>
        </el-form-item>
        <slot name="toolBar"></slot>
        <el-form-item>
          <el-input size="small" v-model="queryParams.queryKey" placeholder="模糊查询"></el-input>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table ref="elTable" :span-method='objectSpanMethod' highlight-current-row @sort-change="tableSort" @selection-change="selsChange" @row-click="rowClick" :data="resDatas" v-loading="listLoading" header-cell-class-name="table_th" border height="70vh" style="width: 100%;">
      <el-table-column type="selection" width="25" align="center">
      </el-table-column>
      <el-table-column fixed="left" type="index" width="30" align="center">
        <template slot-scope="scope">
          <span>{{scope.$index+(queryParams.pageNumber - 1) * queryParams.pageSize + 1}} </span>
        </template>
      </el-table-column>
      <slot name="operate" />
      <el-table-column label="操作" min-width="150" align="center" v-if="!noEdit">
        <template slot-scope="scope">
          <el-button-group size="mini">
            <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </el-button-group>
        </template>
      </el-table-column>
      <el-table-column :sortable="row.IS_SORT == '1' ? 'custom' : false" v-if="row.PROPERTY_TYPE != '10'" align="center" v-for="(row,index) in resRows" :key="index" :prop="row.COLUMN_NAME" :fixed="(row.IS_FROZEN == 1?'left':false)" :label="row.COLUMN_CNAME" :min-width="(row.COLUMNLENGTH != '')?row.COLUMNLENGTH:150">
        <template slot-scope="scope">
          <span v-if="row.PROPERTY_TYPE == '2'">
            <slot :name="row.COLUMN_NAME" v-bind:row="scope.row">
              <!-- 后备内容 -->
              {{scope.row[`${row.COLUMN_NAME}_TEXT`]}}
            </slot>
          </span>
          <span v-else>
            <slot :name="row.COLUMN_NAME" v-bind:row="scope.row">
              <!-- 后备内容 -->
              {{scope.row[row.COLUMN_NAME]}}
            </slot>
          </span>
        </template>
      </el-table-column>
    </el-table>
    <!--工具条-->
    <el-col :span="24" class="pagination">
      <!-- <el-button v-if="!noEdit" type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button> -->
      <el-pagination background @current-change="handleCurrentChange" :current-page="queryParams.pageNumber" :page-sizes="[30, 60, 100, 150]" :page-size="queryParams.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="sizeChange">
      </el-pagination>
    </el-col>
    <resEdit @initData="getResList" @saveAfter="saveAfter" :dialogState="dialogState" />
  </section>

</template>

<script>
import resEdit from './ResEdit'

export default {
  name: 'resList',
  props: {
    tableId: {
      type: String
    },
    noEdit: {
      type: Boolean,
      default: false
    },
    noAdd: {
      type: Boolean,
      default: false
    },
    query: {
      type: Object,
      String
    }
  },
  components: {
    resEdit
  },
  data() {
    return {
      filters: {
        columns: '',
        name: '',
        value: ''
      },
      resRows: [],
      resDatas: [],
      total: 0,
      listLoading: false,
      sels: [], //列表选中列
      selectObj: {},
      tableHeight: 600,
      dialogState: {
        show: false,
        type: 'add',
        formData: {},
        tableId: this.tableId,
        id: ''
      },
      queryParams: {
        tableId: this.tableId,
        order: '',
        pageNumber: 1,
        pageSize: 30,
        queryColumn: '',
        queryKey: ''
      }
    }
  },
  computed: {
    primaryKey() {
      let key = ''
      this.resRows.map(item => {
        if (item.PROPERTY_TYPE == '10') {
          key = item.COLUMN_NAME
        }
      })
      return key
    }
  },
  methods: {
    changeSelectQuery(name) {
      this.selectObj = this.resRows.filter(item => {
        return item.COLUMN_NAME == name
      })[0]
      if (
        this.selectObj.PROPERTY_TYPE == '2' ||
        this.selectObj.PROPERTY_TYPE == '4'
      ) {
        this.getSjzdData('data', this.selectObj.TYPESQL)
      }
    },
    //获取表格配置信息
    getConfig() {
      this.$ajax
        .get(this.$api.getTableColumns, {
          flag: 'list',
          tableId: this.tableId
        })
        .then(res => {
          this.resRows = res.data
          this.listLoading = false
        })
    },
    //获取表格数据
    getResList: function() {
      if (this.query != undefined) {
        this.queryParams.query = this.query
      }
      this.$ajax.get(this.$api.queryTableData, this.queryParams).then(res => {
        if (res.data) {
          // 给table赋值，重新遍历新增rowSpan属性，checkRoom，appointmentTime为table里面需要合并的属性名称
          this.resDatas = this.mergeTableRow(res.data.data, [
            'SSDD_TEXT',
            'SSDD',
            'BOMID',
            'BOMID_TEXT',
            'ssdd',
            'ssdd_TEXT'
          ])
          this.total = parseInt(res.data.count)
          this.listLoading = false
          this.$nextTick(() => {
            this.$refs.elTable.doLayout()
          })
        }
      })
    },
    //导出
    handleExport() {
      let params = {
        tableId: this.tableId
      }
      if (this.filters.name != '') {
        params.queryColumn = this.resRows.join(',')
        params.queryKey = this.filters.name
      }
      this.$ajax.getBolb(this.$api.exportExcel, params).then(res => {
        if (res.data) {
          let url = URL.createObjectURL(res.data)
          let fileName = res.headers['content-disposition'].split('=')[1]
          fileName = decodeURI(fileName)
          let link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.setAttribute('id', 'downloadLink')
          link.setAttribute('download', fileName)
          document.body.appendChild(link)
          link.click()
          // 删除添加的a链接
          let objLink = document.getElementById('downloadLink')
          document.body.removeChild(objLink)
        }
      })
    },
    //新增按钮
    handleAdd() {
      if (
        this.noEdit &&
        this.$parent.handleAdd &&
        this.$parent.handleAdd != undefined
      ) {
        this.$parent.handleAdd()
      } else {
        this.dialogState.type = 'add'
        this.dialogState.formData = {}
        this.dialogState.show = !this.dialogState.show
      }
    },
    // 点击保存后，如果还想执行什么操作可以在这个方法里进行
    saveAfter(info) {
      this.$emit('saveAfter', info)
    },
    // 编辑按钮事件处理
    handleEdit(row) {
      this.dialogState.formData = row
      this.dialogState.id = row[this.primaryKey]
      this.dialogState.show = true
      this.dialogState.type = 'edit'
    },
    handleDelete(row, type = true) {
      if (type) {
        this.$message.confirmDelete(() => {
          let params = new FormData()
          params.append('tableId', this.tableId)
          params.append(this.primaryKey, row[this.primaryKey])
          this.$ajax.post(this.$api.deleteTableData, params).then(res => {
            if (res && res.data == 1) {
              this.$message.deleteSuccess()
              this.getResList()
            } else {
              this.$message.deleteError(res.data.errmsg)
            }
          })
        })
      } else {
        let params = new FormData()
        params.append('tableId', this.tableId)
        params.append(this.primaryKey, row[this.primaryKey])
        this.$ajax.post(this.$api.deleteTableData, params).then(res => {
          if (res && res.data == 1) {
            this.$message.deleteSuccess()
            this.getResList()
          } else {
            this.$message.deleteError(res.data.errmsg)
          }
        })
      }
    },
    handleCurrentChange(val) {
      this.queryParams.pageNumber = val
      this.getResList()
    },
    sizeChange(val) {
      this.queryParams.pageSize = val
      this.getResList()
    },
    selsChange: function(sels) {
      this.sels = sels
      this.$emit('selectChange', sels)
    },
    rowClick(row) {
      this.$refs.elTable.toggleRowSelection(row)
    },
    //批量删除
    batchRemove: function() {
      var ids = this.sels.map(item => {
        return item[this.primaryKey]
      })
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      })
        .then(() => {
          let params = {}
          params[this.primaryKey] = ids
          params['tableId'] = this.tableId
          this.$ajax.post(this.$api.deleteTableData, params).then(res => {
            if (res && res.data && res.data.data > 0) {
              this.$message({ message: '删除成功', type: 'success' })
              this.getResList()
            }
          })
        })
        .catch(() => {})
    },
    // 获取数据字典数据
    getSjzdData(attr, sql) {
      this.$ajax
        .get(this.$api.getDropDownListData, {
          typesql: sql
        })
        .then(res => {
          this.$set(this.selectObj, attr, res.data)
        })
    },
    // eslint-disable-next-line
    tableSort({ column, prop, order }) {
      if (order && order != null) {
        this.queryParams.order = prop + ' ' + order.replace('ending', '')
      } else {
        this.queryParams.order = ''
      }
      this.getResList()
    },
    objectSpanMethod({ row, column }) {
      const span = column['property'] + '-span'
      if (row[span]) {
        return row[span]
      }
    },
    mergeTableRow(data, merge) {
      if (!merge || merge.length === 0) {
        return data
      }
      merge.forEach(m => {
        const mList = {}
        data = data.map((v, index) => {
          const rowVal = v[m]
          if (mList[rowVal]) {
            mList[rowVal]++
            data[index - (mList[rowVal] - 1)][m + '-span'].rowspan++
            v[m + '-span'] = {
              rowspan: 0,
              colspan: 0
            }
          } else {
            mList[rowVal] = 1
            v[m + '-span'] = {
              rowspan: 1,
              colspan: 1
            }
          }
          return v
        })
      })
      return data
    }
  },
  create() {
    this.getConfig()
    this.getResList()
  },
  activated() {
    this.getConfig()
    this.getResList()
  },
  beforeRouteLeave() {
    this.$destory()
  },
  watch: {
    queryParams: {
      deep: true,
      handler() {
        let columns = this.resRows.map(item => {
          if (item.ISQUERY == '1') return item.COLUMN_NAME
        })
        columns = columns.filter(item => {
          return item != undefined
        })
        this.queryParams.queryColumn = columns.join(',')
        this.getResList()
      }
    },
    dialogState: {
      deep: true,
      handler() {
        if (!this.dialogState.show) {
          this.getResList()
        }
      }
    },
    'query.SSHT'(){
        if (this.query != undefined) {
          this.queryParams.query = this.query
        }
        this.getConfig()
        this.getResList()
    }
  }
}
</script>
<style>
.toolbar {
  /* text-align: right; */
}
.el-form-item {
  margin-bottom: 0px;
}
.pagination {
  padding: 10px;
  text-align: right;
}
.el-table--striped .el-table__body tr.el-table__row--striped td {
  background: #f5f4f4;
}
</style>