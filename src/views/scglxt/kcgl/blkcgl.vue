<template>
  <div class="blkcgl">
    <el-row>
      <el-col>
        <el-button type="primary" @click="manyBOMBl">批量备料</el-button>
      </el-col>
    </el-row>
    <el-table class="el-table" @expand-change="expandChange" :data="clList" v-loading="listLoading" stripe border :max-height="tableHeight" style="width: 100%;">
      <el-table-column prop="ID" label="材料状态" :min-width="100">
        <template slot-scope="scope">
          <el-radio-group v-model="scope.row.CLZT" class="radioGroup">
            <el-radio @change="changeRadio(scope.row)" class="radio" :label="1">完成备料</el-radio>
            <el-radio v-show="scope.row.CLZT !=0 && scope.row.CLZT !=2" @change="changeRadio(scope.row)" class="radio" :label="2">自备料</el-radio>
            <el-radio v-show="scope.row.CLZT !=2 && scope.row.CLZT !=0" @change="changeRadio(scope.row)" class="radio" :label="0">待采购</el-radio>
          </el-radio-group>
          <span @click="cgClick(scope.row)" v-show="scope.row.CLZT != '' || scope.row.CLZT != null" class="spanText">{{clztData[scope.row.CLZT]}}</span>
        </template>
      </el-table-column>
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-table ref="bomTable" @selection-change="selectChange" @row-click="bomClick" :data="props.row.bomList">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column v-if="row.PROPERTY_TYPE != '10'" align="center" v-for="(row,index) in blColumns" :key="index" :prop="row.COLUMN_NAME" :fixed="(row.IS_FROZEN == 1?'left':false)" :label="row.COLUMN_CNAME" :min-width="(row.COLUMNLENGTH != '')?row.COLUMNLENGTH:150">
              <template slot-scope="scope">
                <div v-if="row.COLUMN_NAME == 'CLZT'">
                  <el-radio-group v-model="scope.row.CLZT" class="radioGroup">
                    <el-radio @change="changeRadio(scope.row)" class="radio" :label="1">完成备料</el-radio>
                    <el-radio v-show="scope.row.CLZT !=0 && scope.row.CLZT !=2" @change="changeRadio(scope.row)" class="radio" :label="2">自备料</el-radio>
                    <el-radio v-show="scope.row.CLZT !=2 && scope.row.CLZT !=0" @change="changeRadio(scope.row)" class="radio" :label="0">待采购</el-radio>
                  </el-radio-group>
                  <span @click="cgClick(scope.row)" v-show="scope.row.CLZT != '' || scope.row.CLZT != null" class="spanText">{{clztData[scope.row.CLZT]}}</span>
                </div>
                <div v-else>
                  <span v-if="row.PROPERTY_TYPE == '2' || row.PROPERTY_TYPE == '4'">
                    {{scope.row[`${row.COLUMN_NAME}_TEXT`]}}
                  </span>
                  <span v-else>
                    {{scope.row[row.COLUMN_NAME]}}
                  </span>
                </div>

              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column v-for="(el,index) in columnDatas" :key="index" :prop="el.id" align="center" :fixed="(el.frozen == 1?'left':false)" :label="el.name" :min-width="(el.length != '')?el.length:150">
        <template slot-scope="scope">
          <el-tag  v-if="el.id == 'DDLEVEL'" effect='dark' :type="scope.row.DDLEVEL == '0402' ? 'warning' : scope.row.DDLEVEL == '0403' ? '' : 'danger'">{{scope.row.DDLEVEL_TEXT}}</el-tag>
           <span v-else>{{scope.row[el.id]}}</span>
        </template>
      </el-table-column>
    </el-table>
    <cgjy :dialogState="dialogState" />
  </div>
</template>

<script>
import cgjy from './components/cgjy'
export default {
  name: 'blkcgl',
  components: {
    cgjy
  },
  data() {
    return {
      tableId: '010404',
      tableHeight: 600,
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
      // columnDatas: [
      //   {
      //     id: 'CLMC',
      //     name: '材料名称'
      //   },
      //   {
      //     id: 'CLDJ',
      //     name: '材料单价'
      //   },
      //   {
      //     id: 'CLSL',
      //     name: '当前库存'
      //   },
      //   {
      //     id: 'CLMD',
      //     name: '密度'
      //   }
      // ],
      blColumns: [],
      clList: [],
      clztData: {
        0: '待采购',
        1: '完成备料',
        2: '自备料'
      },
      dialogState: {
        show: false,
        row: {}
      },
      tableData: []
    }
  },
  mounted() {
    var offsetHeight = window.innerHeight
    this.tableHeight = offsetHeight - 220
    this.getSjzdData()
  },
  methods: {
    selectChange(sel, row) {
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
      this.$ajax
        .get(this.$api.getBLlist, {
          clid: row.ID
        })
        .then(res => {
          if (res.errno == 0) {
            row.bomList = res.data
          }
        })
      this.getConfig()
    },
    //批量备料
    manyBOMBl() {
      let params = ''
      this.selBomList.map(item => {
        params = params + item.ID + ','
      })
      this.$ajax
        .post(this.$api.updateBLZT, {
          id: params,
          clzt: '1'
        })
        .then(res => {
          if (res.errno == 0) {
            this.$message.success('更新备料状态成功！')
            this.initData(this.activeRow)
          }
        })
    },
    // 获取数据字典数据
    getSjzdData() {
      this.$ajax
        .get(this.$api.getDropDownListData, {
          typesql:
            // "select ID,CLMC,CLDJ,CLSL,MI CLMD from  scglxt_t_cl where id in (select zddcz from scglxt_t_bom where (clzt IS NULL or clzt=0 or clzt =2) AND cldx!='')"
            "select ID,XMNAME,DDLEVEL,(SELECT NAME FROM (SELECT id,mc NAME FROM scglxt_tyzd WHERE xh LIKE '04__') tras WHERE tras.id=DDLEVEL) DDLEVEL_TEXT,STARTTIME,ENDTIME from scglxt_t_dd where id in (select ssdd from scglxt_t_bom where  (clzt IS NULL or clzt=0 or clzt =2) AND cldx!=''  ) ORDER BY DDLEVEL,STARTTIME"
        })
        .then(res => {
          if (res.errno == 0) {
            this.clList = res.data
          }
        })
    },
    //获取表格配置信息
    getConfig() {
      this.$ajax
        .get(this.$api.getTableColumns, {
          flag: 'list',
          tableId: this.tableId
        })
        .then(res => {
          this.blColumns = res.data
          this.listLoading = false
        })
    },
    //点击待采购
    cgClick(row) {
      if (row.CLZT == '0') {
        this.dialogState.show = true
        this.dialogState.row = row
      }
    },
    changeRadio(row) {
      this.$ajax
        .post(this.$api.updateBLZT, {
          id: row.ID,
          clzt: row.CLZT
        })
        .then(res => {
          if (res.errno == 0) {
            this.$message.success('更新备料状态成功！')
            this.initData(this.activeRow)
          }
        })
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
