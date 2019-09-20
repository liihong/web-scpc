<template>
  <div class="scqkgz">
    <el-row>
      <el-col :span="12">
        <el-card>
          <bar-echarts :option="option" class="echarts-container"></bar-echarts>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <bar-echarts :option="option" class="echarts-container"></bar-echarts>
        </el-card>
      </el-col>
      <el-row>
        <el-col :span="4">
          <el-input size="small" v-model="query.queryKey" placeholder="模糊查询"></el-input>
        </el-col>
      </el-row>
      <el-col :span="24">
        <el-card class="card">
          <div slot="header" class="clearfix" v-for="ddInfo in clList" :key="ddInfo.ID">
            <span class="xmTitle">{{ddInfo.XMNAME}}</span>
            <span class="xmTime">{{ddInfo.STARTTIME}} ~ {{ddInfo.ENDTIME}}</span>
            <el-tag v-if="ddInfo.DDLEVEL == '0401'" type="danger">{{ddInfo.DDLEVEL_TEXT}}</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import barEcharts from '@/components/Echarts/barEcharts'

export default {
  name: 'blkcgl',
  components: {
    barEcharts
  },
  data() {
    return {
      option: {
        title: {
          text: '工时汇总(单位：小时)',
          left: '50%'
        },
        grid: {
          top: 25,
          bottom: 20
        },
        tooltip: {
          show: true,
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            textStyle: {
              color: '#fff'
            }
          }
        },
        barGap: 0,
        xAxis: [
          {
            data: []
          }
        ],
        series: [
          {
            name: '排产工时',
            type: 'bar',
            stack: '总量 ',
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  position: 'top',
                  formatter: '{b}\n{c}'
                },
                barBorderRadius: 5
              },
              emphasis: {
                barBorderRadius: 5
              }
            },
            data: []
          }
        ]
      },
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
      blColumns: [
        {
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
        }
      ],
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
      this.$ajax.get(this.$api.getGygsPc).then(res => {
        if (res.errno == 0) {
          let xAxis = [],
            datas = []
          res.data.map(item => {
            xAxis.push(item.gymc)
            datas.push(item.zgs)
          })
          this.option.xAxis[0].data = xAxis
          this.option.series[0].data = datas
        }
      })

      this.$ajax.post(this.$api.getDdListByWhere, this.query).then(res => {
        if (res.errno == 0) {
          this.clList = res.data.data
          this.query.total = res.data.count
        }
      })
    }
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
.echarts-container {
  width: 100%;
  height: 300px;
}
.card{
  .xmTitle{
    font-size: 24px;
    font-weight: 500;
  }
  .xmTime{
color:#666666;
margin-left:20px;
  }
}
</style>
