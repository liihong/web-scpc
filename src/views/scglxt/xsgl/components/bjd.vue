<template>
  <el-dialog title="合同报价单" :visible.sync="dialogState.show" width="50%">
    <el-row>
      <el-col>
        <div style="color:#42b983">当前客户：{{dialogState.row.KHID_TEXT}} </div>
        <div style="color:#42b983">当前合同：{{dialogState.row.HTBH}} </div>
      </el-col>
      <el-col class="upload">
        <el-upload class="upload-demo" :auto-upload="false" ref="upload" action="/api/util/upload" :on-remove="handleRemove" :on-change="onUpload" :file-list="fileList">
          <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
          <el-button v-if="step == 1" style="margin-left: 10px;" size="small" type="success" @click="nextStep">下一步</el-button>
          <el-button v-if="step == 2" style="margin-left: 10px;" size="small" type="success" @click="submitUpload">确认信息上传到服务器并入库</el-button>
          <div slot="tip" class="el-upload__tip">可以上传xls/xlsx</div>
        </el-upload>
      </el-col>
      <el-col v-if="step ==2">
        <DataTable :nohandle=false :columnDatas="columns" :tableDatas="dataList" />
      </el-col>
    </el-row>

  </el-dialog>
</template>

<script>
import XLSX from 'xlsx'
import DataTable from '@/components/Table/dataTable'
export default {
  components: {
    DataTable
  },
  props: ['dialogState'],
  data() {
    return {
      fileList: [],
      dataList: [],
      columns: [
        {
          name: '序号',
          id: 'xh',
          length: 40
        },
        {
          name: '零件名称',
          id: 'ljmc'
        },
        {
          name: '图纸号',
          id: 'th'
        },
        {
          name: '材质',
          id: 'cz'
        },
        {
          name: '单位',
          id: 'dw',
          length: 50
        },
        {
          name: '单价',
          id: 'dj'
        },
        {
          name: '总金额',
          id: 'zje'
        },
        {
          name: '数量',
          id: 'sl',
          length: 50
        },
        {
          name: '未税单价',
          id: 'wsdj'
        },
        {
          name: '含税单价',
          id: 'hsdj'
        },
        {
          name: '税金',
          id: 'sj',
          length: 50
        }
      ],
      outputHeader:['xh','ljmc','th','cz','dw','sl','dj','zje','wsdj','hsdj','sj'],
      step: 1
    }
  },
  mounted() {},
  methods: {
    nextStep() {
      this.step = 2
    },
    submitUpload(res) {
      this.$refs.upload.submit()
      if(res){
          this.$ajax.post(this.$api.addBjd,{form: this.dataList}).then(res=>{
              if(res && res.errno == 0){
                  this.$message.success('报价单导入成功！')
                  this.dialogState.show = false
              }
          })
      }
    },
    handleRemove() {
      // console.log(item)
    },
    onUpload(file) {
      let files = { 0: file.raw }
      this.readExcel(files)
    },
    readExcel(files) {
      const that = this
      //表格导入
      if (files.length <= 0) {
        //如果没有文件名
        return false
      } else if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
        this.$Message.error('上传格式不正确，请上传xls或者xlsx格式')
        return false
      }

      const fileReader = new FileReader()
      fileReader.onload = ev => {
        try {
          const data = ev.target.result
          const workbook = XLSX.read(data, {
            type: 'binary'
          })
          const wsname = workbook.SheetNames[0] //取第一张表
          console.log(wsname)
          const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname], {header:that.outputHeader,defval:''}) //生成json表格内容
          console.log(ws)
          if (ws.length > 0) {
            let temp = []
            ws.splice(11,ws.length-23).map(item => {
              // this.columns.map(el => {
              //   obj[el.id] = item[el.name] == undefined ? '' : item[el.name]
              // })
              item.ssht = this.dialogState.row.ID
              item.id = this.$util.getUUId()
              temp.push(item)
            })
            this.dataList = temp
            // this.dataList = ws.splice(11,ws.length-23)
            console.log(this.dataList)
          }
        } catch (e) {
          return false
        }
      }
      fileReader.readAsBinaryString(files[0])
    }
  },
  watch: {
    'dialogState.show'() {
      if (this.dialogState.show) {
        this.fileList = []
        this.dataList = []
        this.step = 1
      }
    }
  }
}
</script>

<style scoped>
.upload {
  margin: 20px;
}
</style>
