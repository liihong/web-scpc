<template>
  <div class="dd-working">
    <img width="100%"
         src="../../../assets/images/head.png" />
    <div class="header-button"
         @click="cntzClick">产能调整</div>
    <div class="working">
      <div>
        <bar-echarts :option="option"
                     class="echarts-container"></bar-echarts>
      </div>
      <div>
        <el-button type="primary"
                   @click="exportExecel">导出表格</el-button>
        <el-button type="primary"
                   @click="queryWeek">本周</el-button>
      </div>
      <el-table id="out-table"
                class="working-table"
                height="65vh"
                :cell-class-name="getCellStyle"
                header-cell-class-name="header-style"
                :data="tableData">
        <el-table-column type="index"
                         width="25"
                         align="center"></el-table-column>
        <el-table-column min-width="200"
                         prop="xmname"
                         label="项目名称"
                         align="left">
          <template slot-scope="scope">
            <router-link style="color:#48b884;"
                         :to="{path: 'jgqkhz', query: {ddid: scope.row.id}}"
                         target="_blank">{{scope.row.xmname}}</router-link>
          </template>
        </el-table-column>
        <el-table-column min-width="250"
                         prop="mark"
                         label="标注"
                         align="left"></el-table-column>
        <el-table-column min-width="110"
                         prop="starttime"
                         label="开始时间"
                         align="center"></el-table-column>
        <el-table-column min-width="110"
                         prop="endtime"
                         label="结束时间"
                         align="center">
          <template slot-scope="scope">
            <span :class="checkTime(scope.row['endtime'])?'': 'red'">
              {{scope.row['endtime']}}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="che"
                         label="车"
                         align="center"></el-table-column>
        <el-table-column prop="xi"
                         label="铣"
                         align="center"></el-table-column>
        <el-table-column prop="cnc"
                         label="CNC"
                         align="center"></el-table-column>
        <el-table-column prop="xqg"
                         label="线切割"
                         align="center"></el-table-column>
        <el-table-column prop="dhh"
                         label="电火花"
                         align="center"></el-table-column>
        <el-table-column prop="qian"
                         label="钳"
                         align="center"></el-table-column>
        <el-table-column prop="mo"
                         label="磨"
                         align="center"></el-table-column>
        <el-table-column prop="hanjie"
                         label="焊接"
                         align="center"></el-table-column>
        <el-table-column prop="waixie"
                         label="外协"
                         align="center"></el-table-column>
        <el-table-column prop="zhusu"
                         label="注塑"
                         align="center"></el-table-column>
        <el-table-column prop="rechuli"
                         label="热处理"
                         align="center"></el-table-column>
        <el-table-column prop="sygs"
                         label="总计"
                         align="center"></el-table-column>
      </el-table>
    </div>
    <sbcn :dialogState="dialogState" />
  </div>
</template>

<script>
import barEcharts from "@/components/Echarts/barEcharts";
import sbcn from "./components/sbcn";
import FileSaver from "file-saver";
import XLSX from "xlsx";
export default {
  components: {
    barEcharts,
    sbcn
  },
  data () {
    return {
      dialogState: {
        show: false
      },
      option: {
        backgroundColor: "#00233a",
        title: {
          text: "工时汇总(单位：小时)",
          left: "70%",
          textStyle: {
            color: "#00D5FF"
          }
        },
        grid: {
          top: 25,
          bottom: 20
        },
        tooltip: {
          show: true,
          trigger: "axis",
          axisPointer: {
            type: "line",
            textStyle: {
              color: "#fff"
            }
          }
        },
        barGap: 0,
        xAxis: [
          {
            axisLabel: {
              show: true,
              textStyle: {
                color: "#fff"
              }
            },
            data: []
          }
        ],
        series: [
          {
            name: "排产工时",
            type: "bar",
            stack: "总量 ",
            itemStyle: {
              normal: {
                color: "#00FFF4",
                label: {
                  show: true,
                  position: "top",
                  formatter: "{b}\n{c}"
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
    };
  },
  mounted () {
    this.initData();
    let _this = this;
    this.$socket.on("getTableData", () => {
      _this.initData();
    });
  },
  methods: {
    getCellStyle ({ rowIndex }) {
      if (Number.isInteger(rowIndex / 2) == 0) {
        return "cell-stripe-style";
      } else {
        return "cell-style";
      }
    },
    initData (isCustom = true) {
      this.$ajax.get(this.$api.getGygsPc).then(res => {
        if (res.errno == 0) {
          let xAxis = [],
            datas = [];
          res.data.map(item => {
            xAxis.push(item.gymc);
            datas.push(item.zgs);
          });
          this.option.xAxis[0].data = xAxis;
          this.option.series[0].data = datas;
        }
      });
      this.$ajax.post(this.$api.getDDWorkSpeed, {
        isCustom: isCustom
      }).then(res => {
        if (res.errno == 0) {
          this.tableData = res.data;
          let sums = [], sums2 = [], sums3 = [];
          Object.keys(this.tableData[0]).forEach((column, index) => {
            if (index === 1) {
              sums['xmname'] = "总计(分钟)";
              sums2['xmname'] = "总计(小时)";
              sums3['xmname'] = "总计(天)";
              return;
            }

            const values = this.tableData.map(item =>
              Number(item[column])
            );
            if (!values.every(value => isNaN(value))) {
              sums[column] = values.reduce((prev, curr) => {
                const value = Number(curr);
                if (!isNaN(value)) {
                  return prev + curr;
                } else {
                  return prev;
                }
              }, 0);
            } else {
              sums[column] = "";
            }
            sums2[column] = (sums[column] / 60).toFixed(2)
            sums3[column] = ((sums[column] / 60) / 24).toFixed(2)

            if (column == 'starttime' || column == 'endtime') {
              sums2[column] = "";
              sums3[column] = "";
            }
          });
          this.tableData.push(sums)
          this.tableData.push(sums2)
          this.tableData.push(sums3)
        }
      });
    },
    queryWeek () {
      this.initData(false)
    },
    cntzClick () {
      this.dialogState.show = true;
    },
    checkTime (endtime) {
      let date1 = new Date(endtime);
      let date2 = new Date();
      if (date1.getTime() > date2.getTime()) {
        return true;
      } else {
        return false;
      }
    },
    exportExecel () {
      /* generate workbook object from table */
      var wb = XLSX.utils.table_to_book(document.querySelector("#out-table"));
      /* get binary string as output */
      var wbout = XLSX.write(wb, {
        bookType: "xlsx",
        bookSST: true,
        type: "array"
      });
      try {
        FileSaver.saveAs(
          new Blob([wbout], { type: "application/octet-stream" }),
          "车间生产工时.xlsx"
        );
      } catch (e) {
        if (typeof console !== "undefined") console.log(e, wbout);
      }
      return wbout;
    },
    getSummaries (param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "总工时";
          return;
        }
        const values = data.map(item => Number(item[column.property]));
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0);
          // sums[index] = (sums[index] / 60).toFixed(2) + "时";
        } else {
          sums[index] = "";
        }
      });

      return sums;
    }
  }
};
</script>

<style lang="scss">
.dd-working {
  background: #00233a;
  overflow: hidden;
  // 表头不对齐bug
  .gutter {
    display: table-cell !important;
  }
  .working {
    padding: 20px;
  }
  .header-style {
    border-bottom: 0 !important;
  }
}
.header-button {
  cursor: pointer;
  color: #ffffff;
  position: absolute;
  right: 10px;
  top: 15px;
}
.echarts-container {
  height: 160px;
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
.red {
  color: rgb(240, 62, 62);
}
</style>
