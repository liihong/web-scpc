<template>
  <div class="personal">
    <div class="personal-base">
      <el-tabs v-model="activeName">
        <el-tab-pane label="基本信息"
                     name="first">
          <div>姓名：{{name}}</div>
          <div>所属班组：{{roleNames[0]}}</div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-tabs @tab-click="changeTab" v-model="activeName">
      <el-tab-pane label="今日工时统计"
                   name="first">
        <el-table class="el-table"
                  :data="tableData"
                  stripe
                  border
                  show-summary
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
                  show-summary
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
export default {
  components: {
    tableData,
  },
  data () {
    return {
      activeName: 'first',
      columnDatas: [
        { id: 'ddmc', name: '订单名称' },
        { id: 'bommc', name: '零件名称' },
        { id: 'jgjs', name: '加工件数' },
        { id: 'jyrymc', name: '检验人员' },
        { id: 'sbmc', name: '使用设备' },
        { id: 'jgkssj', name: '开始时间' },
        { id: 'jgjssj', name: '结束时间' },
        { id: 'bzgs', name: '总工时' },
        { id: 'edgs', name: '额定工时' },
      ],
      tableData: [],
      monthData: []
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
        }
      })
    },
    initMonth(){
      this.$ajax.get(this.$api.getPersonalMonth).then(res => {
        if (res) {
          this.monthData = res.data
        }
      })
    },
    changeTab(tab){
      if(tab.name === 'first'){
        this.initData()
      }else {
        this.initMonth()
      }
    }
  }
}
</script>

<style>
.personal {
  margin: 30px;
}
</style>