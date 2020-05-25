<template>
  <div class="ddgl">
    <ResList tableId='0117' noEdit ref="zjgl">
      <el-table-column slot="operate" fixed="left" label="操作" min-width="110" align="center">
        <template slot-scope="scope">
          <el-button-group size="mini">
            <el-button size="mini" type="primary" @click="exportZj(scope.row)">导出</el-button>
            <el-button size="mini" type="warning" @click="copyZj(scope.row)">复制</el-button>
            <el-button size="mini" type="primary" @click="editBomRow(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </ResList>
    <editZj ref="editZj" :dialogState="dialogState" />
    <el-dialog title="导出" :visible.sync="dialogVisible" width="20%">
      <span>
        <el-radio v-model="radio" label="1">导出金额</el-radio>
        <el-radio v-model="radio" label="2">不导出金额</el-radio>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="exportClick">导出</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import editZj from './components/editZj'
export default {
  name: 'zjgl',
  components: {
    editZj
  },
  data() {
    return {
      dialogVisible: false,
      radio:"1",
      exportId:'',
      dialogState: {
        show: false,
        type: 'add',
        formData: {
          id: this.$util.getUUId(),
          zjmc: ''
        }
      }
    }
  },
  methods: {
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
    copyZj(row) {
      this.dialogState.type = "copy";
      this.dialogState.id = row.id;
      this.dialogState.formData = row;
      this.dialogState.show = true;
      this.$refs.editZj.getFormData(row.id);
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
              this.$refs.zjgl.getResList()
            } else {
              this.$message.deleteError(res.data.errmsg)
            }
          })
      })
    },
    exportZj(row) {
      this.exportId = row.ssdd
      this.dialogVisible = true
    },
    exportClick(row) {
      //   let params = {
      //   id: row.ssdd
      // }
      // this.$ajax.getBolb(this.$api.exportDdByZj, params).then(res => {
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

      this.$ajax.getBolb(this.$api.exportDdByZj, {type:this.radio,id:this.exportId}).then(res => {
        if (res.data) {
          let url = URL.createObjectURL(res.data);
          let fileName = res.headers["content-disposition"].split("=")[1];
          fileName = decodeURI(fileName);
          let link = document.createElement("a");
          link.style.display = "none";
          link.href = url;
          link.setAttribute("id", "downloadLink");
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();
          // 删除添加的a链接
          let objLink = document.getElementById("downloadLink");
          document.body.removeChild(objLink);
        }
      });
    }
  }
}
</script>
