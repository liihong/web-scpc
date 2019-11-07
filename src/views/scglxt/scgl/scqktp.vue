<template>
  <div class="zjgl">
    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-input @keyup.enter.native="queryData" style="width:200px;" size="small" v-model="query.queryKey" placeholder="模糊查询"></el-input>
      <el-button size="mini" @click="lookDDWorking" type="primary">订单生产实时看板</el-button>
    </el-col>
    <el-table class="el-table" @expand-change="expandChange" :data="ddList" stripe border style="width: 100%;">
      <el-table-column fixed="left" label="操作" min-width="50" align="center">
        <template slot-scope="scope">
          <el-button-group size="mini">
            <el-button size="mini" type="primary" @click="exportZj(scope.row)">导出</el-button>
            <!-- <el-button size="mini" type="primary" @click="editBomRow(scope.row)">编辑</el-button> -->
            <!-- <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button> -->
          </el-button-group>
        </template>
      </el-table-column>
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-table stripe ref="bomTable" :data="props.row.bomList">
            <el-table-column :align="el.align ? el.align : 'center'" v-for="(el,index) in zjColumns" :key="index" :prop="el.id" :label="el.name" :min-width="(el.length != '')?el.length:150">
              <template slot-scope="scope">
                <div v-if="el.id == 'ddjd'" v-html="scope.row[el.id]"></div>
                <el-date-picker style="width:150px;" v-else-if="el.id == 'endtime'" size="mini" v-model="scope.row[el.id]" type="date" placeholder="选择结束日期">
                </el-date-picker>
                <span v-else>{{scope.row[el.id]}}</span>
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
import ResTreeList from '@/views/resMgr/ResTreeList'
export default {
  name: 'scqktp',
  components: {
    ResTreeList
  },
  data() {
    return {
      dialogState: {
        show: false,
        type: 'add',
        formData: {
          id: this.$util.getUUId(),
          zjmc: ''
        }
      },
      ddList: [],
      tableId: '0117',
      zjColumns: [
        {
          id: 'zddmc',
          name: '零件名称'
        },
        {
          id: 'zddztmc',
          name: 'BOM状态'
        },
        {
          id: 'starttime',
          name: '开始时间'
        },
        {
          id: 'endtime',
          name: '结束时间',
          length: 150
        },
        {
          id: 'jgsl',
          name: '加工数量',
          length: 80
        },
        {
          id: 'ddjd',
          name: '订单进度(报废件数/已加工件数/可加工件数)',
          align: 'left',
          length: 200
        }
      ],
      activeRow: {},
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
      query: {
        pageSize: 10,
        pageNumber: 1,
        total: 0
      }
    }
  },
  mounted() {
    let _this = this
    this.initData()

    this.$socket.on('getTableData', () => {
      _this.initData()
    })
  },
  methods: {
    async initData() {
      let res = await this.$ajax.post(this.$api.getWorkingDDList, this.query)
      if (res.errno == 0) {
        this.ddList = res.data.data.map(item => {
          item.bomList = []
          return item
        })
        this.query.total = res.data.count
      }
    },
    queryData(){
      this.query.pageNumber = 1
      this.initData()
    },
    //翻页
    handleCurrentChange(page) {
      this.query.pageNumber = page
      this.initData()
    },
    sizeChange(size) {
      this.query.pageNumber = 1
      this.query.pageSize = size
      this.initData()
    },
    // 展开执行
    expandChange(row) {
      this.activeRow = row
      this.getData(row)
    },
    getData(row) {
      this.$ajax
        .post(this.$api.BOMSpeedProgress, {
          ssdd: row.ID
        })
        .then(res => {
          if (res.errno == 0) {
            row.bomList = res.data
          }
        })
    },
    //查看订单实时看板
    lookDDWorking() {
      window.open('/dd-working')
    }
  },
  watch: {
    ddList() {}
  }
}
</script>
<style>
.toolbar {
  margin-bottom: 15px;
  display: flex;
}
</style>
