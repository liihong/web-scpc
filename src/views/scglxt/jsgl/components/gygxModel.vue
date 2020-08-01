<template>
  <div>
    <el-button type="primary" v-print="'#printTest'">打印出库单</el-button>
    <el-button type="primary" @click="exportExcel">导出Excel</el-button>
    <div id="printTest">
      <table id="out-table" class="gygc" border="1" v-for="(item,i) in bomList" :key="i">
        <thead>
          <th style="text-align:left;position:relative;" colspan="9">
            <barcode
              fontSize="12px"
              style="float: right;"
              width="1px"
              height="10px"
              :options="options"
              v-bind:value="item.id"
            >Show this if the rendering fails.</barcode>
            <span>订单：{{ddData.xmname}}</span>
          </th>
        </thead>
        <tr>
          <td style="font-size:24px;" colspan="3" rowspan="2">工艺过程卡</td>
          <td style="height:28px;">组件</td>
          <td></td>
          <td>材质</td>
          <td>{{item.clmc}}</td>
          <td>交货日期</td>
          <td>{{item.jhsj}}</td>
        </tr>
        <tr>
          <td style="height:28px;">零件名称</td>
          <td colspan="3">{{item.zddmc}}</td>
          <td>零件数量</td>
          <td>{{item.jgsl}}</td>
        </tr>
        <tr>
          <td>序号</td>
          <td>所属设备</td>
          <td>工艺内容</td>
          <td>
            额定工时
            <br />(分钟/件)
          </td>
          <td>
            总工时
            <br />(分钟/件)
          </td>
          <td>
            准备工时
            <br />(分钟/件)
          </td>
          <td>完成日期</td>
          <td>操作者</td>
          <td style="width:60px;">检验</td>
        </tr>
        <tr v-for="(el,j) in item.gygxList" :key="j">
          <td>{{j+1}}</td>
          <td>{{el.sbmc}}</td>
          <td style="width:210px;">{{el.gynr}}</td>
          <td>{{el.edgs}}</td>
          <td>{{el.zgs}}</td>
          <td>{{el.zbgs}}</td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td
            style="font-size: 12px;text-align:left;"
            colspan="9"
          >标准会签：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;工艺会签：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; 质量会签：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 工艺编制：李勇 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;校对：</td>
        </tr>
        <tr>
          <td
            style="font-size: 12px;text-align:left;"
            colspan="9"
          >审 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 定：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 批 &nbsp;&nbsp;&nbsp;&nbsp; 准：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;临时更改：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;更改批准：</td>
        </tr>
        <tr>
          <td
            colspan="9"
            style="font-size: 12px;text-align:left;"
          >本工艺卡片由操作者妥善保管，加工完交验后并填写工序交接时间随图纸一同转入下道工序，最终由检验负责收回备案</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import VueBarcode from "vue-barcode";
import FileSaver from "file-saver";
import XLSX from "xlsx";

export default {
  components: {
    barcode: VueBarcode
  },
  data() {
    return {
      bomList: [
        {
          id: "",
          ddmc: "JOT-00498",
          zddcz: "304",
          jhsj: "2019-01-03",
          zddmc: "EM072773.1 2",
          jgsl: 20
        }
      ],
      ddData: {},
      options: {
        width: "1px", //单个条形码的宽度
        height: "35px",
        fontSize: "12px"
      }
    };
  },
  mounted() {
    this.initData();
  },
  methods: {
    initData() {
      this.$ajax
        .get(this.$api.getDdBOMData, {
          id: "202005091456332119318"
        })
        .then(res => {
          if (res.errno == 0) {
            this.ddData = res.data.ddInfo[0];
            this.bomList = res.data.bomInfo;
          }
        });
    },
    exportExcel() {
      /* generate workbook object from table */
      var wb = XLSX.utils.table_to_book(document.querySelector("#printTest"));
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
        throw(e)
      }
      return wbout;
    }
  },
  watch: {}
};
</script>

<style>
.gygc {
  width: 700px;
  margin-top: 50px;
  text-align: center;
}
</style>