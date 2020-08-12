<!--公用组件：数据表格
   /**
   * dataTable
   * @module components/dataTable
   * @desc 数据表格
   * @author lihong
   * @date 2017年12月05日17:22:43
   * @param {string} [columnDatas] - 列名数组对象
   * @param {Object} [tableData]  - 表数据
   * @param {Boolean} [noFootBold]  - 是否最后一行加粗，true不加粗
   * @param {Boolean} [noFormate]  - 是否格式化数字
   * @example
   *  <hbTable :title="title" :columns="columns" :tableData="tableData"></hbTable>
   */
-->
<template>
  <section>
    <!--列表-->
    <el-table class="el-table"
              :data="tableData"
              v-loading="listLoading"
              stripe
              border
              :show-summary="isSum"
              :max-height="tableHeight"
              style="width: 100%;">
      <el-table-column v-for="(row,index) in columnDatas"
                       :key="index"
                       :prop="row.id"
                       align="center"
                       :fixed="(row.frozen == 1?'left':false)"
                       :label="row.name"
                       :min-width="(row.length != '')?row.length:150">
        <template slot-scope="scope">
          <slot v-if="row.slot"
                :row="scope.row"
                :index="scope.$index"
                :name="row.slot"></slot>
          <span v-else>{{scope.row[row.id]}}</span>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script>
import Table from 'element-ui'
export default {
  name: 'dataTable',
  extends: Table,
  props: ['priarmyKey', 'columnDatas', 'tableDatas', 'tableInfo', 'nohandle', 'showDetail','isSum'],
  data () {
    return {
      filters: {
        columns: '',
        name: ''
      },
      name: '',
      tableData: [],
      total: 0,
      pageNumber: 1,
      pageSize: 20,
      listLoading: false,
      sels: [], //列表选中列
      selColumns: [],
      tableHeight: 500
    }
  },
  computed: {
  },
  methods: {
    //导出
    handleExport () {
      window.location.href = this.$api.exportData + '?tableId=' + this.tableId
    },
    queryList () {
      // this.pageNumber = 1;
      this.$emit('pageChange', 1);
      this.$emit('initData', this.name)
    },
    sizeChange (val) {
      this.pageSize = val;
      // this.pageNumber = 1;
      this.$emit('pageSizeChange', this.pageSize);
      // this.getData()
    },
    //新增按钮
    handleAdd () {
      this.$emit('handleAdd')
    },
    // 编辑按钮事件处理
    handleEdit (index) {
      this.$router.push({
        path: '/resEdit'
      })
      this.$emit('handleEdit', index)
    },
    handleCurrentChange (val) {
      this.pageNumber = val
      this.$emit('pageChange', val)
    },
    selsChange: function (sels) {
      this.sels = sels
    },
    //批量删除
    batchRemove: function () {
      var ids = this.sels.map(item => item.id).toString()
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      })
        .then(() => {
          this.listLoading = true
          let para = { ids: ids }
          this.batchRemoveUser(para).then(res => {
            this.listLoading = false
            if (res.data) {
              this.$message({
                message: '删除成功',
                type: 'success'
              })
              this.getUsers()
            }
          })
        })
        .catch(() => { })
    }
  },
  mounted () {
    var offsetHeight = window.innerHeight
    this.tableHeight = offsetHeight - 220
    if (this.tableDatas && this.tableDatas.length > 0) {
      this.tableData = this.tableDatas
    } else {
      this.tableData = this.tableInfo.list
      this.pageNumber = this.tableInfo.curPagerNo
      this.pageSize = this.tableInfo.pageSize
      this.total = this.tableInfo.rowsCount
    }
  },
  watch: {
    tableInfo () {
      if (this.tableDatas && this.tableDatas.length > 0) {
        this.tableData = this.tableDatas
      } else {
        this.tableData = this.tableInfo.list
        this.pageNumber = this.tableInfo.curPagerNo
        this.pageSize = this.tableInfo.pageSize
        this.total = this.tableInfo.rowsCount
      }
    },
    tableDatas:{
      deep:true,
      handler:()=>{
        if (this.tableDatas && this.tableDatas.length > 0) {
        this.tableData = this.tableDatas
      } else {
        this.tableData = this.tableInfo.list
        this.pageNumber = this.tableInfo.curPagerNo
        this.pageSize = this.tableInfo.pageSize
        this.total = this.tableInfo.rowsCount
      }
      }
    }
  }
}
</script>
<style lang="scss"  scpoed>
.toolbar {
  padding: 10px;
  margin: 10px 0;
  background: #f2f2f2;
  .el-form-item {
    margin-bottom: 0px;
  }
}
</style>