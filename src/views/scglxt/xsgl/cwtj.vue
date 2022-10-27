<template>
  <div class="grgstj">
    <div class="newToolBar">
      <div style="display: flex">
        <datePicker @sureBtnClick="sureBtnClick" v-model="selectDate" />
      </div>
      <div>
        <el-button
          style="margin-left: 10px"
          @click="exportExcel"
          type="primary"
          icon="el-icon-s-promotion"
          >导出</el-button
        >
      </div>
      <div>
        名称：
        <el-input style="width: 150px" v-model="queryValue" />
        <el-button @click="initData" type="primary">搜索</el-button>
        <el-checkbox v-model="isOnlyMine">只看我</el-checkbox>
      </div>
    </div>
    <el-table
      ref="elTable"
      show-summary
      :data="tableData"
      header-cell-class-name="table_th"
      id="out-table"
      border
      :max-height="tableHeight"
    >
        <el-table-column
          :prop="el.prop"
          align="center"
          v-for="(el, index) in columnList"
          :key="index"
          :width="el.width ? el.width : ''"
          :label="el.label"
        ></el-table-column>
    </el-table>
  </div>
</template>

<script>
import datePicker from "@/components/DatePicker";
import FileSaver from "file-saver";
import XLSX from "xlsx";

export default {
  components: {
    datePicker,
  },
  data() {
    return {
      tableHeight: 600,
      selectDate: "",
      queryValue: "",
      bzList: [],
      tableData: [],
      isOnlyMine: false,
      columnList: [
        {
          prop: "mc",
          label: "客户名称",
          width:'200px'
        },
        {
          prop: "htbh",
          label: "合同编号",
          width:'100px'
        },
        {
          prop: "remark",
          label: "备注",
        },
        {
          prop: "xmname",
          label: "订单编号",
          width:'120px'
        },
        {
          prop: "lxr",
          label: "联系人",
        },
        {
          prop: "lxdh",
          label: "联系电话",
        },
        {
          prop: "qssj",
          label: "签署日期",
        },
        {
          prop: "jssj",
          label: "交货日期",
        },
        {
          prop: "htje",
          label: "合同金额",
        },
        {
          prop: "bjdzj",
          label: "报价单金额",
        },
        {
          prop: "jkje",
          label: "结款金额",
        },
        {
          prop: "yfzt",
          label: "预付状态",
        },
        {
          prop: "wkzt",
          label: "尾款状态",
        },
        {
          prop: "kpzt",
          label: "开票状态",
        },
      ],
    };
  },
  created() {},
  methods: {
    async initData() {
      let resDatas = await this.$ajax.post(this.$api.getHttjByDate, {
        date: this.selectDate,
        htmc: this.queryValue,
      });
      if (resDatas.errno == 0) {
        this.tableData = resDatas.data;
      }
    },
    sureBtnClick(time) {
      this.selectDate = time;
      this.initData();
    },
    //导出
    exportExcel() {
      /* generate workbook object from table */
      // var wb = XLSX.utils.table_to_book(document.querySelector('#out-table'))
      const id = "#out-table";
      var fix = document.querySelector(".el-table__fixed");
      var wb;
      if (fix) {
        wb = XLSX.utils.table_to_book(
          document.querySelector(id).removeChild(fix)
        );
        document.querySelector(id).appendChild(fix);
      } else {
        wb = XLSX.utils.table_to_book(document.querySelector(id));
      }
      /* get binary string as output */
      var wbout = XLSX.write(wb, {
        bookType: "xlsx",
        bookSST: true,
        type: "array",
      });
      try {
        FileSaver.saveAs(
          new Blob([wbout], { type: "application/octet-stream" }),
          "合同统计" + this.selectDate + ".xlsx"
        );
      } catch (e) {
        throw e;
      }
      return wbout;

      //  this.$ajax.getBolb(this.$api.exportPersonalStat, {
      //    date: this.selectDate
      //  }).then(res => {
      //   if (res.data) {
      //     let url = URL.createObjectURL(res.data)
      //     let fileName = res.headers['content-disposition'].split('=')[1]
      //     fileName = decodeURI(fileName)
      //     let link = document.createElement('a')
      //     link.style.display = 'none'
      //     link.href = url
      //     link.setAttribute('id', 'downloadLink')
      //     link.setAttribute('download', fileName)
      //     document.body.appendChild(link)
      //     link.click()
      //     // 删除添加的a链接
      //     let objLink = document.getElementById('downloadLink')
      //     document.body.removeChild(objLink)
      //   }
      // })
    },
  },
};
</script>
<style lang="scss" scoped>
.newToolBar {
  display: flex;
  align-items: center;
  margin: 0 0 10px 0;
}
.grgstj {
  margin: 10px;
}
</style>
