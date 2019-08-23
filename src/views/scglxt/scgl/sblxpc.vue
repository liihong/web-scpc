<template>
    <el-card>
        <bar-echarts :option="option" class="echarts-container"></bar-echarts>
    </el-card>
</template>

<script>
import barEcharts from '@/components/Echarts/barEcharts'
export default {
  components: {
    barEcharts
  },
  data() {
    return {
      option: {
        title: {
          text: '设备类型排产'
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
            name: '排产天数',
            type: 'bar',
            stack: '总量 ',
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  position: 'top',
                  formatter: '{b}\n{c}天'
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
      }
    }
  },
  created() {
    this.initData()
  },
  methods: {
    async initData() {
      let res = await this.$ajax.get(this.$api.getSblxPc)
      if (res.errno == 0) {
        let xAxis = [],
          datas = []
        res.data.map(item => {
          xAxis.push(item.k)
          datas.push(item.t)
        })
        this.option.xAxis[0].data = xAxis
        this.option.series[0].data = datas
      }
    }
  }
}
</script>

<style>
.echarts-container {
  width: 100%;
  height: 500px;
}
</style>
