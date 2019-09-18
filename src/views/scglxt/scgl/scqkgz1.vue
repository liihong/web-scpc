<template>
  <div class="blkcgl">
    <el-table class="el-table" @expand-change="initData" :data="clList" v-loading="listLoading" stripe border :max-height="tableHeight" style="width: 100%;">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-table ref="bomTable" @selection-change="selectChange" @row-click="bomClick" :data="tableData">
            <el-table-column align="center" v-for="(row,index) in blColumns" :key="index" :prop="row.id"  :label="row.name">
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column v-for="(el,index) in columnDatas" :key="index" :prop="el.id" align="center" :fixed="(el.frozen == 1?'left':false)" :label="el.name" :min-width="(el.length != '')?el.length:150">
        <template slot-scope="scope">
          <el-tag v-if="el.id == 'DDLEVEL'" effect='dark' :type="scope.row.DDLEVEL == '0402' ? 'warning' : scope.row.DDLEVEL == '0403' ? '' : 'danger'">{{scope.row.DDLEVEL_TEXT}}</el-tag>
           <span v-else>{{scope.row[el.id]}}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'blkcgl',
  components: {
  },
  data() {
    return {
      tableHeight: 800,
      activeRow: {},
      listLoading: false,
      radioValue: '',
      selBomList: [],
      columnDatas: [
        {
          id: 'XMNAME',
          name: '订单名称'
        },
        {
          id: 'DDLEVEL',
          name: '订单级别'
        },
        {
          id: 'STARTTIME',
          name: '开始时间'
        },
        {
          id: 'ENDTIME',
          name: '结束时间'
        }
      ],
      blColumns: [{
          id: 'zddmc',
          name: '零件名称'
        },
         {
          id: 'starttime',
          name: '开始时间'
        },
        {
          id: 'endtime',
          name: '结束时间'
        },
        {
          id: '车',
          name: '车'
        },
        {
          id: '铣',
          name: '铣'
        },
        {
          id: 'CNC',
          name: 'CNC'
        },
        {
          id: '线切割',
          name: '线切割'
        },
        {
          id: '电火花',
          name: '电火花'
        },
        {
          id: '钳',
          name: '钳'
        },
        {
          id: '磨',
          name: '磨'
        },
        {
          id: '焊接',
          name: '焊接'
        },
        {
          id: '热处理',
          name: '热处理'
        }],
      clList: [],
      tableData: [],
      query: {
        where: 'ckzt is null',
        pageSize: 20,
        pageNumber: 1
      }
    }
  },
  mounted() {
    var offsetHeight = window.innerHeight
    this.tableHeight = offsetHeight - 80
    this.getSjzdData()
  },
  methods: {
    selectChange(sel) {
      this.selBomList = sel
    },
    bomClick(row) {
      this.$refs.bomTable.toggleRowSelection(row)
    },
    // 展开执行
    expandChange(row) {
      this.activeRow = row
      this.initData(row)
    },
    initData(row) {
      this.activeRow = row
      this.$ajax
        .post(this.$api.getGYgslist, {
          ddid: row.ID
        })
        .then(res => {
          if (res.errno == 0) {
            row.bomList = res.data
            this.tableData = res.data
          }
        })
    },
    
    // 获取数据字典数据
    getSjzdData() {
      // this.$ajax
      //   .get(this.$api.getDropDownListData, {
      //     typesql:
      //       // "select ID,CLMC,CLDJ,CLSL,MI CLMD from  scglxt_t_cl where id in (select zddcz from scglxt_t_bom where (clzt IS NULL or clzt=0 or clzt =2) AND cldx!='')"
      //       "select ID,XMNAME,DDLEVEL,(SELECT NAME FROM (SELECT id,mc NAME FROM scglxt_tyzd WHERE xh LIKE '04__') tras WHERE tras.id=DDLEVEL) DDLEVEL_TEXT,STARTTIME,ENDTIME from scglxt_t_dd where id in (select ssdd from scglxt_t_bom where  (clzt IS NULL or clzt=0 or clzt =2) AND cldx!=''  ) ORDER BY DDLEVEL,STARTTIME"
      //   })
      //   .then(res => {
      //     if (res.errno == 0) {
      //       this.clList = res.data
      //     }
      //   })

        this.$ajax.post(this.$api.getDdListByWhere, this.query).then(res => {
        if (res.errno == 0) {
          this.clList = res.data.data
          this.query.total = res.data.count
        }
      })
    },
  }
}
</script>
<style lang="scss" scoped>
.radioGroup {
  text-align: left;
}
.radio {
  margin-left: 0 !important;
  margin-right: 0 !important;
}
</style>
