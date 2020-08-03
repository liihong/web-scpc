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
      <div>
        名称：
        <el-input style="width:150px;"
                  v-model="queryValue" />
        <el-button @click="getTableData"
                   type="primary">搜索</el-button>
      </div>
    </div>
    <el-table ref="elTable"
              show-summary
              :data="tableData"
              id="out-table"
              border
              :max-height="tableHeight">
      <el-table-column width="400"
                       fixed
                       align="center"
                       label="工艺过程卡明细">
        <el-table-column type="index"
                         align="center"
                         min-width="10"></el-table-column>
        <el-table-column key="ddmc"
                         min-width="130"
                         prop="ddmc"
                         align="center"
                         label="项目名称"></el-table-column>
        <el-table-column min-width="160"
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
      </el-table-column>
      <template v-for="item in bzList">
        <el-table-column align="center"
                         :key="item.id"
                         :label="item.bzmc">
          <el-table-column :prop="el.rymc"
                           align="center"
                           v-for="(el,index) in item.peopleList"
                           :key="index"
                           width="60px"
                           :label="el.rymc"></el-table-column>
        </el-table-column>
      </template>

    </el-table>
    <jgjlDialog :dialogState="dialogJgjl" />
  </div>
</template>

<script>
import datePicker from '@/components/DatePicker'
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
import jgjlDialog from '../zlgl/components/jgjlDialog'

export default {
  components: {
    datePicker,
    jgjlDialog
  },
  data () {
    return {
      tableHeight: 600,
      selectDate: '',
      queryValue: '',
      bzList: [],
      tableData: [],
      dialogJgjl: {
        show: false,
        query: {}
      }
    }
  },
  created () {
    this.initData()
    this.$socket.on('getTableData', () => {
      this.initData()
    })
  },
  methods: {
    openJgjl (bomid) {
      this.dialogJgjl.query = { BOMID: bomid }
      this.dialogJgjl.show = true
    },
    async getTableData () {
      let resDatas = await this.$ajax.post(this.$api.getPeopleHour, {
        date: this.selectDate,
        zddmc: this.queryValue
      })
      if (resDatas.errno == 0) {
        this.tableData = resDatas.data
      }
    },
    async initData () {
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
    sureBtnClick (time) {
      this.selectDate = time
      this.getTableData()
    },
    //导出
    exportExcel () {
      /* generate workbook object from table */
      // var wb = XLSX.utils.table_to_book(document.querySelector('#out-table'))
      const id = '#out-table'
      var fix = document.querySelector('.el-table__fixed');
      var wb;
      if (fix) {
        wb = XLSX.utils.table_to_book(document.querySelector(id).removeChild(fix));
        document.querySelector(id).appendChild(fix);
      } else {
        wb = XLSX.utils.table_to_book(document.querySelector(id));
      }
      /* get binary string as output */
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
        throw (e)
      }
      return wbout

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
    }
  }
}
</script>
<style lang="scss" scoped>
.newToolBar {
  // display: flex;
  margin: 0 0 10px 0;
}
.grgstj {
  margin: 10px;
}
</style>
