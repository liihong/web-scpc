<template>
  <div class="zjgl">
    <!--工具条-->
    <el-col :span="24" class="toolbar">
        <el-button size="mini" @click="lookDDWorking" type="primary">订单生产实时看板</el-button>
    </el-col>
    <el-table class="el-table" @expand-change="expandChange" :data="ddList" stripe border style="width: 100%;">
      <el-table-column fixed="left" label="操作" min-width="50" align="center">
        <template slot-scope="scope">
          <el-button-group size="mini">
            <el-button size="mini" type="primary" @click="exportZj(scope.row)">导出</el-button>
            <!-- <el-button size="mini" type="primary" @click="editBomRow(scope.row)">编辑</el-button> -->
            <!-- <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button> -->
          </el-button-group>
        </template>
      </el-table-column>
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-table stripe ref="bomTable" :data="props.row.bomList">
              <el-table-column :align="el.align ? el.align : 'center'" v-for="(el,index) in zjColumns" :key="index" :prop="el.id" :label="el.name" :min-width="(el.length != '')?el.length:150">
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
import ResTreeList from '@/views/resMgr/ResTreeList'
export default {
  name: 'scqktp',
  components: {
    ResTreeList
  },
  data() {
    return {
      dialogState: {
        show: false,
        type: 'add',
        formData: {
          id: this.$util.getUUId(),
          zjmc: ''
        }
      },
      ddList: [],
      tableId: '0117',
      zjColumns: [
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
          name: '订单进度(报废件数/已加工件数/可加工件数)',
          align: 'left',
          length: 200
        }
      ],
      activeRow: {},
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
      query:{
        pageSize: 30,
        pageNumber: 1
      }
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    async initData() {
      let res = await this.$ajax.post(this.$api.getWorkingDDList, this.query)
      if (res.errno == 0) {
        this.ddList = res.data.data.map(item=>{
          item.bomList = []
          return item
        })
      }
    },
    // 展开执行
    expandChange(row) {
      this.activeRow = row
      this.getData(row)
    },
    getData(row) {
      this.$ajax
        .post(this.$api.BOMSpeedProgress, {
          ssdd: row.ID
        })
        .then(res => {
          if (res.errno == 0) {
            row.bomList = res.data
          }
        })
    },
    //新增事件处理
    handleAdd() {
      this.dialogState.type = 'add'
      this.dialogState.id = this.$util.getUUId()
      this.dialogState.show = true
      this.dialogState.formData = {
        id: this.$util.getUUId(),
        zjmc: ''
      }
    },
    editBomRow(row) {
      this.dialogState.type = 'edit'
      this.dialogState.id = row.id
      this.dialogState.formData = row
      this.dialogState.show = true
      this.$refs.editZj.getFormData(row.id)
    },
    // 删除组件的同时，要把组件和标准件的关系同时删除
    handleDelete(row) {
      this.$message.confirm('删除组件，并删除组件关联标准件？', () => {
        this.$ajax
          .post(this.$api.deleteZjById, {
            id: row.id
          })
          .then(res => {
            if (res && res.errno == 0) {
              this.$message.deleteSuccess('删除该组件关系成功！')
              this.getData(this.activeRow)
            } else {
              this.$message.deleteError(res.data.errmsg)
            }
          })
      })
    },
    //查看订单实时看板
    lookDDWorking(){
      window.open('/dd-working')
    }
  },
  watch:{
    ddList(){
    }
  }
}
</script>
<style>
.toolbar{
  margin-bottom: 15px;
}
</style>
