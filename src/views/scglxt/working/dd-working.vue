<template>
  <div class="dd-working">
    <img width="100%" src="../../../assets/images/head.png">
    <div class="header-button" @click="cntzClick">产能调整</div>
    <div class="working">
      <div>
        <bar-echarts :option="option" class="echarts-container"></bar-echarts>
      </div>
      <el-table class="working-table" :cell-class-name="getCellStyle" header-cell-class-name="header-style" show-summary :data="tableData">
        <el-table-column type="index" width="25" align="center">
        </el-table-column>
        <el-table-column min-width="150" prop="xmname" label="项目名称" align="center"></el-table-column>
        <el-table-column min-width="100" prop="starttime" label="结束时间" align="center"></el-table-column>
        <el-table-column min-width="100" prop="endtime" label="结束时间" align="center"></el-table-column>
        <el-table-column prop="xqg" label="线切割" align="center"></el-table-column>
        <el-table-column prop="xi" label="铣" align="center"></el-table-column>
        <el-table-column prop="qian" label="钳" align="center"></el-table-column>
        <el-table-column prop="zhusu" label="注塑" align="center"></el-table-column>
        <el-table-column prop="che" label="车" align="center"></el-table-column>
        <el-table-column prop="cnc" label="CNC" align="center"></el-table-column>
        <el-table-column prop="dhh" label="电火花" align="center"></el-table-column>
        <el-table-column prop="mo" label="磨" align="center"></el-table-column>
        <el-table-column prop="rechuli" label="热处理" align="center"></el-table-column>
        <el-table-column prop="hanjie" label="焊接" align="center"></el-table-column>
        <el-table-column prop="waixie" label="外协" align="center"></el-table-column>
        <el-table-column prop="remark" label="标记" align="center"></el-table-column>
      </el-table>
    </div>
    <sbcn :dialogState="dialogState" />
  </div>
</template>

<script>
import barEcharts from '@/components/Echarts/barEcharts'
import sbcn from './components/sbcn'
export default {
  components: {
    barEcharts,
    sbcn
  },
  data() {
    return {
      dialogState:{
        show: false
      },
      option: {
        backgroundColor: '#00233a',
        title: {
          text: '工时汇总(单位：小时)',
          left: '70%',
          textStyle: {
            color: '#00D5FF'
          }
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
                color: '#00FFF4',
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
      tableData: []
    }
  },
  mounted() {
    this.initData()
    let _this  = this
    this.$socket.on('getTableData', () => {
      _this.initData()
    })
  },
  methods: {
    getCellStyle({ rowIndex }) {
      if (Number.isInteger(rowIndex / 2) == 0) {
        return 'cell-stripe-style'
      } else {
        return 'cell-style'
      }
    },
    initData() {
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
      this.$ajax.get(this.$api.getDDWorkSpeed).then(res => {
        if (res.errno == 0) {
          this.tableData = res.data
        }
      })
    },
    cntzClick(){
      this.dialogState.show = true
    }
  }
}
</script>

<style lang="scss">
.dd-working {
  background: #00233a;
  .working {
    padding: 20px;
  }
}
.header-button{
  color:#ffffff;
  position: absolute;
  right:10px;
  top:15px;
}
.echarts-container {
  height: 400px;
}
.working-table {
  .cell-style {
    font-size: 18px;
    color: #00d5ff;
    background: #162736;
    border-bottom: 0;
  }
  .cell-stripe-style {
    font-size: 18px;
    color: #00d5ff;
    background: #2b4b67;
    border-bottom: 0;
  }
}
</style>
