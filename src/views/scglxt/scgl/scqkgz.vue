<template>
  <div class="blkcgl">
     <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-input @keyup.enter.native="getSjzdData"  @change="getSjzdData" style="width:200px;" size="small" v-model="query.xmname" placeholder="模糊查询"></el-input>
      <el-button size="mini" @click="getSjzdData" type="primary">查询</el-button>
      <el-button size="mini" @click="lookDDWorking" type="primary">订单生产实时看板</el-button>
    </el-col>
    <el-table class="el-table" :expand-row-keys="$route.query.ddid" row-key="id" header-cell-class-name="table_th" @expand-change="initData" :data="clList" v-loading="listLoading" stripe border :max-height="tableHeight" style="width: 100%;">
      <el-table-column fixed="left" label="操作" min-width="100" align="center">
        <template slot-scope="scope">
          <el-button-group size="mini">
            <el-button size="mini" type="primary" @click="uploadEndTime(scope.row)">修改交货时间</el-button>
          </el-button-group>
        </template>
      </el-table-column>
      <el-table-column  type="expand">
        <template slot-scope="props">
          <el-button size="mini" type="primary" @click="uploadBOMEndTime(props.row.bomList)">保存BOM结束时间</el-button>
          <el-table ref="bomTable"  header-cell-class-name="table_th2" @row-click="bomClick" :data="props.row.bomList">
            <el-table-column align="center" v-for="(row,index) in blColumns" :key="index" :prop="row.id"  :label="row.name" :min-width="(row.length == undefined)?150:row.length">
              <template slot-scope="scope">
                <div style="text-align:left;" v-html="scope.row.ddjd" v-if="row.slot == 'ddjd'"></div> 
                 <el-date-picker style="width:150px;" v-else-if="row.id == 'endtime'" size="mini" v-model="scope.row[row.id]" type="date"  value-format="yyyy-MM-dd" placeholder="选择结束日期">
                </el-date-picker>
                <span v-else>{{scope.row[row.id]}}</span>
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
    <updateEndTime :dialogState="dialogState"></updateEndTime>
  </div>
</template>

<script>
import updateEndTime from './components/updateEndTime.vue'
export default {
  name: 'blkcgl',
  components: {
    updateEndTime
  },
  data() {
    return {
      dialogState:{
        show:false,
        row:{}
      },
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
          id: 'endtime',
          name: '结束时间'
        },
        {
          id: 'ddjd',
          name: '订单进度(报废件数/已加工件数/可加工件数)',
          align: 'left',
          slot: 'ddjd',
          length: 400
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
        xmname: '',
        where: 'ckzt is null',
        pageSize: 20,
        pageNumber: 1
      }
    }
  },
  mounted() {
    var offsetHeight = window.innerHeight
    this.tableHeight = offsetHeight - 80
    if(this.$route.query.ddid){
      this.query.ddid = this.$route.query.ddid
    }
    this.getSjzdData()
  },
  methods: {
    bomClick(row) {
      this.$refs.bomTable.toggleRowSelection(row)
    },
    //修改某一个订单的交货时间
    uploadEndTime(row){
      this.dialogState.row = row
      this.dialogState.show = true
    },
    uploadBOMEndTime(list){
      this.$message.confirm('是否确认保存所有零件的结束时间？',() => {
        this.$ajax.post(this.$api.uploadBOMEndTime,{
          list:list
        }).then(res => {
          if (res.errno == 0) {
            this.$message('修改交货日期成功！')
            this.dialogState.show = false
          }
        })
      })
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
      this.$ajax
         .post(this.$api.getGYgslist, {
          ddid: row.id
        })
        .then(res => {
          if (res.errno == 0) {
            row.bomList = res.data
            this.tableData = res.data
            this.$forceUpdate()
          }
        })
    },
    
    // 获取数据字典数据
    getSjzdData() {
        this.$ajax.post(this.$api.getDDWorkSpeed, this.query).then(res => {
        if (res.errno == 0) {
          this.initList = res.data.map(item => {
            item.bomList = []
            return item
          })

          this.clList = this.initList.slice(this.query.pageNumber-1,this.query.pageSize)
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
