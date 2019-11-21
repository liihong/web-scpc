<template>
  <div class="blkcgl">
     <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-input @keyup.enter.native="queryData" style="width:200px;" size="small" v-model="query.queryKey" placeholder="模糊查询"></el-input>
      <el-button size="mini" @click="lookDDWorking" type="primary">订单生产实时看板</el-button>
    </el-col>
    <el-table class="el-table"  header-cell-class-name="table_th" @expand-change="initData" :data="clList" v-loading="listLoading" stripe border :max-height="tableHeight" style="width: 100%;">
      <el-table-column type="expand">
        <template>
          <el-table ref="bomTable"  header-cell-class-name="table_th2" @row-click="bomClick" :data="tableData">
            <el-table-column align="center" v-for="(row,index) in blColumns" :key="index" :prop="row.id"  :label="row.name" :min-length="row.length ==undefined ? 150: row.length">
              <template slot-scope="scope" v-if="scope.row.slot == 'ddjd'">
                <div v-html="scope.row.ddjd"></div>
              </template>
              <template v-else>
                <span>{{scope.row[item.id]}}</span>
              </template>
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
     <el-pagination style="text-align:center;" background @current-change="handleCurrentChange" :current-page="query.pageNumber" :page-sizes="[10, 20, 30, 50]" :page-size="query.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="query.total" @size-change="sizeChange">
    </el-pagination>
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
      initList: [],
      columnDatas: [
        {
          id: 'xmname',
          name: '订单名称'
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
          id:'xqg',
          name:'线切割'
        },
        {
          id:'xi',
          name:'铣'
        },
        {
          id:'qian',
          name:'钳'
        },
        {
          id:'zhusu',
          name:'注塑'
        },
        {
          id:'che',
          name:'车'
        },
        {
          id:'cnc',
          name:'CNC'
        },
        {
          id:'dhh',
          name:'电火花'
        },
        {
          id:'rechuli',
          name:'热处理'
        },
        {
          id:'hanjie',
          name:'焊接'
        },
        {
          id:'waixie',
          name:'外协'
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
          id: 'ddjd',
          name: '订单进度(报废件数/已加工件数/可加工件数)',
          align: 'left',
          slot: 'ddjd',
          length: 200
        },
        {
          id: 'endtime',
          name: '结束时间'
        },
        {
          id: '线切割',
          name: '线切割'
        },
        {
          id: '铣',
          name: '铣'
        },
        {
          id: '钳',
          name: '钳'
        },
        {
          id: '注塑',
          name: '注塑'
        },
        {
          id: '车',
          name: '车'
        },
        {
          id: 'CNC',
          name: 'CNC'
        },
        {
          id: '电火花',
          name: '电火花'
        },
        {
          id: '热处理',
          name: '热处理'
        },
        {
          id: '磨',
          name: '磨'
        },
        {
          id: '焊接',
          name: '焊接'
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
    let _this = this
    this.$socket.on('getTableData', () => {
      _this.getSjzdData()
    })
  },
  methods: {
    bomClick(row) {
      this.$refs.bomTable.toggleRowSelection(row)
    },
    // 展开执行
    expandChange(row) {
      this.activeRow = row
      this.initData(row)
    },
    //翻页
    handleCurrentChange(page) {
      this.query.pageNumber = page
      let data = [...this.initList]
      this.clList = data.slice(this.query.pageNumber,this.query.pageSize)
    },
    sizeChange(size) {
      this.query.pageNumber = 1
      this.query.pageSize = size
      let data = [...this.initList]
      this.clList = data.slice(this.query.pageNumber,this.query.pageSize)
  
    },
    initData(row) {
      this.activeRow = row
      this.$ajax
         .post(this.$api.getGYgslist, {
          ddid: row.id
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
        this.$ajax.post(this.$api.getDDWorkSpeed, this.query).then(res => {
        if (res.errno == 0) {
          this.initList = res.data
          this.clList = res.data.slice(this.query.pageNumber,this.query.pageSize)
          this.query.total = res.data.length
        }
      })
    },
    //查看订单实时看板
    lookDDWorking() {
      window.open('/dd-working')
    }
  }
}
</script>
<style lang="scss">
.radioGroup {
  text-align: left;
}
.radio {
  margin-left: 0 !important;
  margin-right: 0 !important;
}
.table_th2{
   background: red;
}
</style>
