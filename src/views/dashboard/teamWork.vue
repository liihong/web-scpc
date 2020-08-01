<template>
  <div class="grgstj">
    <div class="newToolBar">
      <div style="display:flex;">
        <datePicker @sureBtnClick="sureBtnClick"
                    v-model="selectDate" />
        <el-button style="margin-left:10px;"
                   size="mini"
                   @click="exportExcel"
                   type="primary"
                   icon="el-icon-s-promotion">导出</el-button>
      </div>
    </div>
    <div class="flex">
      <el-card shadow="never"
               :body-style="{ padding: '10px' }">
        <b>工人完成工时对比</b>
        <bar-echarts :option="option"
                     class="echarts-container"></bar-echarts>
      </el-card>
      <el-card style="margin-left:10px" shadow="never"
               :body-style="{ padding: '10px' }">
        <b>剩余工时对比</b>
        <bar-echarts :option="pieOption"
                     class="echarts-container"></bar-echarts>
      </el-card>
    </div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="完成工时"
                   lazy
                   name="first">
        <el-table ref="elTable"
                  show-summary
                  :data="tableData"
                  id="out-table"
                  header-row-class-name="el-table-gray-header"
                  :max-height="tableHeight">
          <el-table-column type="index"
                           align="center"
                           width="20"></el-table-column>
          <el-table-column key="ddmc"
                           min-width="150"
                           prop="ddmc"
                           align="center"
                           label="项目名称"></el-table-column>
          <el-table-column min-width="150"
                           align="left"
                           key="bommc"
                           prop="bommc"
                           label="零件名称">
            <template slot-scope="scope">
              <a @click="openJgjl(scope.row.id)"
                 style="text-align:left;cursor:pointer;"
                 v-html="scope.row.bommc"></a>
            </template>
          </el-table-column>
          <el-table-column key="jgsl"
                           prop="jgsl"
                           align="center"
                           label="数量"></el-table-column>
          <el-table-column :prop="el.rymc"
                           align="center"
                           v-for="(el,index) in peopleList"
                           :key="index"
                           min-width="60px"
                           :label="el.rymc"></el-table-column>

        </el-table>
      </el-tab-pane>
      <el-tab-pane label="进行中"
                   lazy
                   name="second">
        <teamTable ljzt="0502" />
      </el-tab-pane>
      <el-tab-pane label="待加工"
                   lazy
                   name="second">
        <teamTable ljzt="0502" />
      </el-tab-pane>
      <el-tab-pane label="待检验"
                   lazy
                   name="third">
        <teamTable ljzt="0503" />
      </el-tab-pane>
      <el-tab-pane label="报废日志"
                   lazy
                   name="four">
        <teamTable ljzt="0503" />
      </el-tab-pane>
    </el-tabs>

    <jgjlDialog :dialogState="dialogJgjl" />
  </div>
</template>

<script>
import datePicker from '@/components/DatePicker'
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
import jgjlDialog from '../scglxt/zlgl/components/jgjlDialog'
import barEcharts from "@/components/Echarts/barEcharts";
import teamTable from './components/teamTable.vue'

import { mapGetters } from 'vuex'
export default {
  name: 'teamWork',
  components: {
    barEcharts,
    datePicker,
    jgjlDialog,
    teamTable
  },
  data () {
    return {
      activeName: 'first',
      tableHeight: 600,
      selectDate: '',
      queryValue: '',
      peopleList: [],
      tableData: [],
      dialogJgjl: {
        show: false,
        query: {}
      },
      pieOption:{
        legend: {
            orient: 'center',
            data: ['已加工工时', '剩余工时']
        },
        series: [
            {
                name: '访问来源',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: [
                    {value: 335, name: '已加工工时'},
                    {value: 310, name: '剩余工时'},
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
      },
      option: {
        barGap: 0,
        xAxis: [
          {
            type: 'category',
            axisTick: { show: false },
            data: []
          }
        ],
        series: [
          {
            name: "额定工时(分钟)",
            type: "bar",
            itemStyle: {
              normal: {
                color: "#42b983",
                label: {
                  show: true,
                  position: "top",
                },
              },
            },
            data: [10, 2, 3, 4]
          }
        ]
      },
    }
  },
  computed: {
    ...mapGetters(['roles', 'roleNames', 'fzgy'])
  },
  created () {
    this.initData()
    // this.$socket.on('getTableData', () => {
    //   this.initData()
    // })
  },
  methods: {
    openJgjl (bomid) {
      this.dialogJgjl.query = { BOMID: bomid }
      this.dialogJgjl.show = true
    },
    async getTableData () {
      let resDatas = await this.$ajax.post(this.$api.getPeopleHour, {
        date: this.selectDate,
        gynr: this.fzgy,
        zddmc: this.queryValue
      })
      if (resDatas.errno == 0) {
        this.tableData = resDatas.data

      }
    },
    getSummaries (param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        const values = data.map(item => Number(item[column.rymc]));
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0);
        } else {
          sums[index] = 0;
        }
      });

      this.option.series[0].data = sums
    },
    async initData () {
      let res = await this.$ajax.post(this.$api.getPeopleByBz, {
        bzid: this.roles[0]
      })
      if (res.errno == 0) {
        await this.getTableData()
        this.peopleList = res.data
        this.option.xAxis[0].data = res.data.map(item => item.rymc)
        this.getSummaries({ columns: this.peopleList, data: this.tableData })
      }
    },
    sureBtnClick (time) {
      this.selectDate = time
      this.getTableData()
    },
    //导出
    exportExcel () {
      var wb = XLSX.utils.table_to_book(document.querySelector('#out-table'))
      var wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        bookSST: true,
        type: 'array'
      })
      try {
        FileSaver.saveAs(
          new Blob([wbout], { type: 'application/octet-stream' }),
          '工人工时统计' + this.selectDate + '.xlsx'
        )
      } catch (e) {
        throw(e)
      }
      return wbout
    }
  }
}
</script>
<style lang="scss" scoped>
.newToolBar {
  margin: 0 0 10px 0;
}
.grgstj {
  margin: 10px;
  .echarts-container {
    width: 500px;
    height: 200px;
  }
}
</style>
