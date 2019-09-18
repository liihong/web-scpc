<template>
  <div class="zjgl">
    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-form :inline="true">
        <el-col :span="4">
        </el-col>
        <el-col :span="20">
          <el-form-item>
            <el-button size="mini" @click="handleAdd" type="primary" icon="el-icon-circle-plus">新增</el-button>
          </el-form-item>
        </el-col>
      </el-form>
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
          <el-table ref="bomTable" :data="props.row.bomList">
            <el-table-column fixed="left" label="操作" min-width="110" align="center">
              <template slot-scope="scope">
                <el-button-group size="mini">
                  <el-button size="mini" type="warning" @click="copyZj(scope.row)">复制</el-button>
                  <el-button size="mini" type="primary" @click="editBomRow(scope.row)">编辑</el-button>
                  <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                </el-button-group>
              </template>
            </el-table-column>
            <el-table-column v-if="row.PROPERTY_TYPE != '10'" align="center" v-for="(row,index) in zjColumns" :key="index" :prop="row.COLUMN_NAME" :fixed="(row.IS_FROZEN == 1?'left':false)" :label="row.COLUMN_CNAME" :min-width="(row.COLUMNLENGTH != '')?row.COLUMNLENGTH:150">
              <template slot-scope="scope">
                <div>
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
          <el-tag v-if="el.id == 'DDLEVEL'" effect='dark' :type="scope.row.DDLEVEL == '0402' ? 'warning' : scope.row.DDLEVEL == '0403' ? '' : 'danger'">{{scope.row.DDLEVEL_TEXT}}</el-tag>
          <span v-else>{{scope.row[el.id]}}</span>
        </template>
      </el-table-column>
    </el-table>
    <editZj ref="editZj" :dialogState="dialogState" />
  </div>
</template>

<script>
import editZj from './components/editZj'
import ResTreeList from '@/views/resMgr/ResTreeList'
export default {
  name: 'zjgl',
  components: {
    editZj,
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
      zjColumns: [],
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
      ]
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    async initData() {
      let res = await this.$ajax.get(this.$api.getZJTreeList)
      if (res.errno == 0) {
        this.ddList = res.data
      }
    },
    // 展开执行
    expandChange(row) {
      this.activeRow = row
      this.getData(row)
    },
    getData() {
      this.$ajax
        .get(this.$api.getZJListBySSDd, {
          ssdd: this.activeRow.ID
        })
        .then(res => {
          if (res.errno == 0) {
            this.activeRow.bomList = res.data
          }
        })
      this.getConfig()
    },
    //获取表格配置信息
    getConfig() {
      this.$ajax
        .get(this.$api.getTableColumns, {
          flag: 'list',
          tableId: this.tableId
        })
        .then(res => {
          this.zjColumns = res.data
          this.listLoading = false
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
    copyZj(row){
      this.dialogState.type = 'copy'
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
    exportZj(row) {
      let params = {
        id: row.ID
      }
      this.$ajax.getBolb(this.$api.exportDdByZj, params).then(res => {
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
        }
      })
    }
  }
}
</script>
