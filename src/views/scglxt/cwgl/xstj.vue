<template>
  <el-card>
    <div style="display: flex; align-items: center">
      <datePicker @sureBtnClick="sureBtnClick" v-model="selectDate" />
      <!-- 统计方式：<el-radio-group @change="changeSpzt" v-model="spzt">
        <el-radio :label="0">待审批</el-radio>
        <el-radio :label="1">未通过</el-radio>
        <el-radio :label="2">已通过</el-radio>
      </el-radio-group> -->
      <el-button
        style="margin-left: 10px"
        @click="exportExcel"
        type="primary"
        icon="el-icon-s-promotion"
        >导出</el-button
      >
    </div>
    <div style="display: flex; align-items: center">
      <bar-echarts :option="option" class="echarts-container"></bar-echarts>
      <bar-echarts :option="option2" class="echarts-container"></bar-echarts>
    </div>
  </el-card>
</template>

<script>
import barEcharts from "@/components/Echarts/barEcharts";
import datePicker from "@/components/DatePicker";
export default {
  components: {
    barEcharts,
    datePicker,
  },
  data() {
    return {
      selectDate: "",
      totalValue: 0,
      option: {
        title: {
          text: "根据客户行业统计",
          left: "center",
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: "vertical",
          left: "left",
        },
        label:{
          normal:{
            show: true,
            position: 'center',
            formatter: '{b} {d}%',
          },
        },
      graphic: {
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text:'总计:',
          textAlign: 'center',
          fill: '#333',
          width: 30,
          height: 30,
          fontSize: 14
        }
      },
        series: [
          {
            name: "客户行业统计",
            type: "pie",
            radius: ["30%",'50%'],
            data: [],
            label: {
                formatter: '{b|{b}：}{c}  {per|{d}%}  ',
                rich: {
                    b: {
                        fontSize: 16,
                        lineHeight: 33
                    },
                    per: {
                        color: '#eee',
                        backgroundColor: '#334455',
                        padding: [2, 4],
                        borderRadius: 2
                    }
                }
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      },
      option2: {
        title: {
          text: "根据客户类型统计",
          left: "center",
        },
        tooltip: {
          trigger: "item",
        },
        legend: {
          orient: "vertical",
          left: "left",
        },
        graphic: {
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
          text:'总计:',
          textAlign: 'center',
          fill: '#333',
          width: 30,
          height: 30,
          fontSize: 14
        }
      },
        series: [
          {
            name: "客户类型统计",
            type: "pie",
            radius: ["30%",'50%'],
            label: {
              formatter: '{b|{b}：}{c}  {per|{d}%}  ',
                rich: {
                   
                    b: {
                        fontSize: 16,
                        lineHeight: 33
                    },
                    per: {
                        color: '#eee',
                        backgroundColor: '#334455',
                        padding: [2, 4],
                        borderRadius: 2
                    }
                }
            },
            data: [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      },
    };
  },
  mounted() {
    // this.sureBtnClick()
  },
  methods: {
    async initData() {
      let res = await this.$ajax.post(this.$api.getKHHYStat,{date: this.selectDate});
      if (res.errno == 0) {
        let totalValue = res.data.khhy.reduce((a,curr) => a + curr.value, 0)
        let totalValue2 = res.data.khlx.reduce((a,curr) => a + curr.value, 0)

        this.option.graphic.style.text = totalValue.toLocaleString('zh-CN', {style: 'currency', currency: 'CNY'});
        this.option2.graphic.style.text = totalValue2.toLocaleString('zh-CN', {style: 'currency', currency: 'CNY'});

        this.option.series[0].data = res.data.khhy;
        this.option2.series[0].data = res.data.khlx;
      }
    },
    sureBtnClick(time) {
      this.selectDate = time;
      this.initData();
    },
    exportExcel() {
      console.log("121");
    },
  },
};
</script>

<style>
.echarts-container {
  width: 100%;
  height: 500px;
}
</style>
