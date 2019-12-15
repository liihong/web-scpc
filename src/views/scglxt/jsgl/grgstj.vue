<template>
  <div class="ddgl">
    <div class="newToolBar">
      <datePicker @sureBtnClick="sureBtnClick" v-model="selectDate" />
      <el-button style="margin-left:10px;" size="small" @click="exportExcel" type="primary" icon="el-icon-s-promotion">导出</el-button>
    </div>
    <el-table ref="elTable" show-summary :data="tableData" id="out-table" border  :max-height="tableHeight">
      <el-table-column align="center" label="工艺过程卡明细">
        <el-table-column  type="index" align="center" min-width="10"></el-table-column>
        <el-table-column key="ddmc" prop="ddmc" align="center" label="项目名称"></el-table-column>
        <el-table-column key="bommc" prop="bommc" align="center" label="零件名称"></el-table-column>
        <el-table-column key="jgsl" prop="jgsl" align="center" label="数量"></el-table-column>
      </el-table-column>
      <el-table-column align="center" v-for="(item,key) in bzList" :key="key" :label="item.bzmc">
        <el-table-column :prop="el.rymc" align="center" v-for="(el,index) in item.peopleList" :key="index" :label="el.rymc"></el-table-column>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import datePicker from '@/components/DatePicker'
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
export default {
  components: {
    datePicker
  },
  data() {
    return {
      tableHeight: 600,
      selectDate: '',
      bzList: [],
      tableData: []
    }
  },
  activated() {
    this.initData()
    this.$socket.on('getTableData', () => {
      this.initData()
    })
  },
  created() {
    this.initData()
    this.$socket.on('getTableData', () => {
      this.initData()
    })
  },
  methods: {
    async getTableData() {
      let resDatas = await this.$ajax.post(this.$api.getPeopleHour, {
        date: this.selectDate
      })
      if (resDatas.errno == 0) {
        this.tableData = resDatas.data
      }
    },
    async initData() {
      this.$ajax.post(this.$api.getBzList).then(res => {
        if (res.errno == 0) {
          let data = res.data
          data = data.filter(item => {
            return item.sftj == 1
          })
          data.map(async item => {
            let res = await this.$ajax.post(this.$api.getPeopleByBz, {
              bzid: item.id
            })
            if (res.errno == 0) {
              item.peopleList = res.data
            }
          })
          this.bzList = data
          this.getTableData()
          this.$forceUpdate()
        }
      })
    },
    sureBtnClick(time) {
      this.selectDate = time
      this.getTableData()
    },
    //导出
    handleExport() {
    },
    exportExcel() {
      /* generate workbook object from table */
      var wb = XLSX.utils.table_to_book(document.querySelector('#out-table'))
      /* get binary string as output */
      var wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        bookSST: true,
        type: 'array'
      })
      try {
        FileSaver.saveAs(
          new Blob([wbout], { type: 'application/octet-stream' }),
          '工人工时统计'+this.selectDate+'.xlsx'
        )
      } catch (e) {
        if (typeof console !== 'undefined') console.log(e, wbout)
      }
      return wbout
    }
  }
}
</script>
<style lang="scss" scoped>
.newToolBar {
  display: flex;
  margin: 0 0 10px 0;
}
</style>
