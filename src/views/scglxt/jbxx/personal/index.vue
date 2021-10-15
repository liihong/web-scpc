<template>
  <div class="personal">
    <div class="personal-base">
      <el-tabs v-model="active">
        <el-tab-pane label="基本信息"
                     name="first">
          <div>姓名：{{name}}</div>
          <div>所属班组：{{roleNames[0]}}</div>

        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="flex-right">
      <div class="flex" style="align-items: center;">
        <el-button @click="handlerExport"
                   type="primary" style="margin-right:30px;">导出</el-button>
        日出勤时间：  <el-radio v-model="radio" label="8h">8h</el-radio>
         <el-radio v-model="radio" label="9h">9h</el-radio>
         <el-radio v-model="radio" label="10h">10h</el-radio>
  <el-radio v-model="radio" label="11h">11h</el-radio>
      </div>
    </div>
    <el-tabs @tab-click="changeTab"
             v-model="activeName">
      <el-tab-pane label="今日工时统计"
                   name="first">
        <el-table class="el-table"
                  :data="tableData"
                  stripe
                  border
                  header-cell-class-name="table_th"
                  style="width: 100%;">
          <el-table-column v-for="(row,index) in columnDatas"
                           :key="index"
                           :prop="row.id"
                           align="center"
                           :fixed="(row.frozen == 1?'left':false)"
                           :label="row.name"
                           :min-width="(row.length != '')?row.length:150">
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="本月工时统计"
                   name="second">
        <el-table class="el-table"
                  :data="monthData"
                  stripe
                  border
                  header-cell-class-name="table_th"
                  style="width: 100%;">
          <el-table-column v-for="(row,index) in columnDatas"
                           :key="index"
                           :prop="row.id"
                           align="center"
                           :fixed="(row.frozen == 1?'left':false)"
                           :label="row.name"
                           :min-width="(row.length != '')?row.length:150">
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="自定义时间"
                   name="three">
        <datePicker @sureBtnClick="sureBtnClick"
                    v-model="selectDate" />
        <el-table class="el-table"
                  :data="threeData"
                  stripe
                  border
                  header-cell-class-name="table_th"
                  style="width: 100%;">
          <el-table-column v-for="(row,index) in columnDatas"
                           :key="index"
                           :prop="row.id"
                           align="center"
                           :fixed="(row.frozen == 1?'left':false)"
                           :label="row.name"
                           :min-width="(row.length != '')?row.length:150">
          </el-table-column>
        </el-table>
      </el-tab-pane>

    </el-tabs>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import tableData from '@/components/Table/dataTable.vue'
import datePicker from '@/components/DatePicker'


export default {
  components: {
    tableData,
    datePicker
  },
  data () {
    return {
      active: 'first',
      activeName: 'first',
      cities: ['8h', '11h'],
      radio: '8h',
      selectDate: '',
      columnDatas: [
        { id: 'ddmc', name: '订单名称' },
        { id: 'bommc', name: '零件名称' },
        { id: 'jgjs', name: '加工件数' },
        { id: 'jyrymc', name: '检验人员' },
        { id: 'sbmc', name: '使用设备' },
        { id: 'jgkssj', name: '开始时间' },
        { id: 'jgjssj', name: '结束时间' },
        { id: 'edgs', name: '额定工时(分钟)' },
        { id: 'edzgs', name: '额定总工时(分钟)' },
        { id: 'bzgs', name: '计划总工时(分钟)' },
      ],
      tableData: [],
      monthData: [],
      threeData: []
    }
  },
  computed: {
    ...mapGetters(['name', 'roleNames'])
  },
  created () {
    this.initData()
  },
  methods: {
    initData () {
      this.$ajax.get(this.$api.getPersonalDay).then(res => {
        if (res) {
          this.tableData = res.data
          let sums = [], sums2 = [];
          Object.keys(res.data[0]).forEach((column, index) => {
            if (index === 1) {
              sums['ddmc'] = "总计(小时)";
              sums2['ddmc'] = "总计(分钟)";
              return;
            }

            const values = res.data.map(item =>
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
            sums2[column] = (sums[column])
            sums[column] = (sums[column] / 60).toFixed(2)

            if (column == 'bommc' || column == 'edgs' || column == 'jgjs' || column == 'sbmc' || column == 'jyrymc' || column == 'jgkssj' || column == 'jgjssj') {
              sums2[column] = "";
              sums[column] = ''
            }
          });
          this.tableData.push(sums2)
          this.tableData.push(sums)
        }
      })
    },
    initMonth () {
      this.$ajax.get(this.$api.getPersonalMonth).then(res => {
        if (res) {
          this.monthData = res.data
          let sums = [], sums2 = [];
          Object.keys(res.data[0]).forEach((column, index) => {
            if (index === 1) {
              sums['ddmc'] = "总计(小时)";
              sums2['ddmc'] = "总计(分钟)";
              return;
            }

            const values = res.data.map(item =>
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
            sums2[column] = (sums[column])
            sums[column] = (sums[column] / 60).toFixed(2)

            if (column == 'bommc' || column == 'edgs' || column == 'jgjs' || column == 'sbmc' || column == 'jyrymc' || column == 'jgkssj' || column == 'jgjssj') {
              sums2[column] = "";
              sums[column] = ''
            }
          });
          this.monthData.push(sums2)
          this.monthData.push(sums)
        }
      })
    },

    initThreeStat () {
      this.$ajax.post(this.$api.getPersonalStatByTime, { date: this.selectDate }).then(res => {
        if (res) {
          this.threeData = res.data
          let sums = [], sums2 = [];
          Object.keys(res.data[0]).forEach((column, index) => {
            if (index === 1) {
              sums['ddmc'] = "总计(小时)";
              sums2['ddmc'] = "总计(分钟)";
              return;
            }

            const values = res.data.map(item =>
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
            sums2[column] = (sums[column])
            sums[column] = (sums[column] / 60).toFixed(2)

            if (column == 'bommc' || column == 'edgs' || column == 'jgjs' || column == 'sbmc' || column == 'jyrymc' || column == 'jgkssj' || column == 'jgjssj') {
              sums2[column] = "";
              sums[column] = ''
            }
          });
          this.threeData.push(sums2)
          this.threeData.push(sums)
        }
      })
    },
    sureBtnClick (time) {
      this.selectDate = time
      this.initThreeStat()
    },

    changeTab (tab) {
      if (tab.name === 'first') {
        this.initData()
      } else if (tab.name === 'second') {
        this.initMonth()
      } else {
        this.initThreeStat()
      }
    },

    handlerChecked(val){
      console.log(val)
    },

    handlerExport () {
      this.$ajax.getBolb(this.$api.exportPersonalGRGSTJ, {
        date: this.selectDate,
        hours: this.radio
      }).then(res => {
        console.log(res)
        if (res.data) {
          let url = URL.createObjectURL(res.data)
          let fileName = res.headers['content-disposition'].split('=')[1]
          fileName = decodeURI(fileName)
          let link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.setAttribute('id', 'downloadLink')
          link.setAttribute('download', fileName)
          document.body.appendChild(link)
          link.click()
          // 删除添加的a链接
          let objLink = document.getElementById('downloadLink')
          document.body.removeChild(objLink)
        }else{
          this.$message.error('没有数据')
        }
      })
    }
  }
}
</script>

<style>
.personal {
  margin: 30px;
}
.flex-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: absolute;
  right: 30px;
  z-index: 999;
}
</style>