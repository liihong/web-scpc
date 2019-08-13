<template>
  <div class="blkcgl">
    <el-table class="el-table" @expand-change="initData" :data="clList" v-loading="listLoading" stripe border :max-height="tableHeight" style="width: 100%;">
      <el-table-column type="expand">
        <template slot-scope="props">
          <div>
            <el-button type="primary" @click="saveHandler(props.row)">保存</el-button>
          </div>
          <el-table ref="bomTable" @selection-change="selectChange" @row-click="bomClick" :data="props.row.bomList">
            <el-table-column align="center" v-for="(el,index) in blColumns" :key="index" :prop="el.id" :label="el.name" :min-width="(el.length != '')?el.length:150">
              <template slot-scope="scope">
                <div v-if="el.id == 'ddjd'" v-html="scope.row[el.id]"></div>
                <el-date-picker style="width:150px;" v-else-if="el.id == 'endtime'" size="mini" v-model="scope.row[el.id]" type="date" placeholder="选择结束日期">
                </el-date-picker>
                <span v-else>{{scope.row[el.id]}}</span>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column v-for="(el,index) in columnDatas" :key="index" :prop="el.id" align="center" :fixed="(el.frozen == 1?'left':false)" :label="el.name" :min-width="(el.length != '')?el.length:150">
        <template slot-scope="scope">
          <el-tag v-if="el.id == 'DDLEVEL'" effect='dark' :type="scope.row.DDLEVEL == '0402' ? 'warning' : scope.row.DDLEVEL == '0403' ? '' : 'danger'">{{scope.row.DDLEVEL_TEXT}}</el-tag>
          <span v-else>{{scope.row[el.id]}}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'blkcgl',
  components: {},
  data() {
    return {
      tableHeight: 800,
      activeRow: {},
      listLoading: false,
      radioValue: '',
      selBomList: [],
      columnDatas: [
        {
          id: 'XMNAME',
          name: '订单名称'
        },
        {
          id: 'DDLEVEL',
          name: '订单级别'
        },
        {
          id: 'STARTTIME',
          name: '开始时间'
        },
        {
          id: 'ENDTIME',
          name: '结束时间'
        }
      ],
      blColumns: [
        {
          id: 'zddmc',
          name: '零件名称'
        },
        {
          id: 'zddztmc',
          name: 'BOM状态'
        },
        {
          id: 'starttime',
          name: '开始时间'
        },
        {
          id: 'endtime',
          name: '结束时间',
          length: 150
        },
        {
          id: 'jgsl',
          name: '加工数量',
          length: 80
        },
        {
          id: 'ddjd',
          name: '订单进度',
          length: 200
        }
      ],
      clList: [],
      tableData: []
    }
  },
  mounted() {
    var offsetHeight = window.innerHeight
    this.tableHeight = offsetHeight - 80
    this.getSjzdData()
  },
  methods: {
    selectChange(sel) {
      this.selBomList = sel
    },
    bomClick(row) {
      this.$refs.bomTable.toggleRowSelection(row)
    },
    // 展开执行
    expandChange(row) {
      this.activeRow = row
      this.initData(row)
    },
    initData(row) {
      this.activeRow = row
      this.$ajax
        .post(this.$api.BOMSpeedProgress, {
          ddid: row.ID
        })
        .then(res => {
          if (res.errno == 0) {
            row.bomList = res.data
            this.tableData = res.data
          }
        })
    },

    // 获取数据字典数据
    getSjzdData() {
      this.$ajax
        .post(this.$api.getDdListByWhere, {
          where: 'ckzt is null'
        })
        .then(res => {
          if (res.errno == 0) {
            this.clList = res.data
          }
        })
    },
    saveHandler(row){
      console.log(row.bomList)
    }
  }
}
</script>
<style lang="scss" scoped>
.radioGroup {
  text-align: left;
}
.radio {
  margin-left: 0 !important;
  margin-right: 0 !important;
}
</style>
