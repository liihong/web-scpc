<template>
  <el-dialog title="订单图纸管理" :visible.sync="dialogState.show" width="80%">
    <div class="title">
      <span>
        当前订单：
        <span style="color:#42b983">{{row.XMNAME}} </span>
        ，请为该订单上传图纸
      </span>
      <span v-if="tzList.length>0">
        <el-button type="primary" @click="handlerUpload">上传当前图纸到服务器</el-button>
      </span>
    </div>
    <el-upload ref="upload" :on-change="chooseFile" :file-list="tzList" action="/api/util/upload" multiple list-type="picture-card" :auto-upload="false">
      <i slot="default" class="el-icon-plus"></i>
      <div slot="file" slot-scope="{file}">
        <img class="el-upload-list__item-thumbnail" :src="file.url" alt="">
        <span class="el-upload-list__item-actions">
          <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
            <i class="el-icon-zoom-in"></i>
          </span>
          <span v-if="!disabled" class="el-upload-list__item-delete" @click="handleDownload(file)">
            <i class="el-icon-download"></i>
          </span>
          <span v-if="!disabled" class="el-upload-list__item-delete" @click="handleRemove(file)">
            <i class="el-icon-delete"></i>
          </span>
        </span>
      </div>
    </el-upload>
  </el-dialog>
</template>

<script>
export default {
  props: {
    dialogState: {
      type: Object
    }
  },
  data() {
    return {
      tzList: [],
      dialogImageUrl: '',
      dialogVisible: false,
      disabled: false
    }
  },
  computed: {
    row() {
      return this.dialogState.row
    }
  },
  methods: {
    chooseFile(file, fileList) {
      this.tzList = fileList
    },
    handleRemove(file) {
      console.log(file)
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    handleDownload(file) {
      console.log(file)
    },
    //上传图纸
    async handlerUpload() {
      // this.$refs.upload.submit()
      let params = new FormData()
      console.log(this.row.ID)
      params.append('ssdd',this.row.ID)
      params.append('file',this.tzList)

      let res  =  await this.$ajax.postBolb('/api' + this.$api.uploadDrawing,params)
      console.log(res)
    },
    // 获取图纸信息
    getTzData() {
      this.$ajax
        .get(this.$api.getDdTz, {
          ssdd: this.dialogState.row.ID
        })
        .then(res => {
          if (res.errno == 0) {
            this.tzList = res.data
          } else {
            this.$message.error('获取订单图纸失败！')
          }
        })
    }
  },
  watch: {
    dialogState: {
      deep: true,
      handler() {
        if (this.dialogState.show) {
          this.getTzData()
        }
      }
    }
  }
}
</script>

<style>
</style>
