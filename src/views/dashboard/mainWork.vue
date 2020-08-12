<template>
  <div class="mainWork">
    <statistics />
    <div>
      <bar-echarts :option="lineOption"
                     class="echarts-container"></bar-echarts>
    </div>
    <el-row :gutter="20"
            style="height:50vh">
      <el-col>
        <el-card class="box-card">
          <div slot="header"
               class="clearfix">
            <span>订单进度</span>
          </div>
          <ddTable />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import statistics from './components/statistics.vue'
import ddTable from './components/ddTable.vue'
import barEcharts from "@/components/Echarts/barEcharts";

export default {
  name: 'mainWork',
  components: {
    statistics,
    ddTable,
    barEcharts
  },
  computed: {
    ...mapGetters(['name', 'roles'])
  },
  data () {
    return {
      lineOption: {
        title: {
          text: '近七日额定工时完成情况'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['邮件营销', '联盟广告', '视频广告', '直接访问', '搜索引擎']
        },
        color: ['#FFC354', '#5D98E2','#EE8181','#4f89ef','#ffc642', '#0040a3','#00bed1','#00d543','#c082ed','#64c97b','#557eeb','#df5259'],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: {
          type: 'value',
          scale:true
        },
        series: []
      }
    }
  },
  mounted () { 
    this.initData()
  },
  methods: {
    initData(){
      this.$ajax.get(this.$api.getAdminStat).then(res=>{
        console.log(res)
        if(res.errno === 0) {
          this.lineOption.xAxis.data = res.data.xAxis
           this.lineOption.legend.data = res.data.legend
           this.lineOption.series = res.data.series
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .echarts-container {
    width: 100%;
    height: 500px;
  }
</style>
