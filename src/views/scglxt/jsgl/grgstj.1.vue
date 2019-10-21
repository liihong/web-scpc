<template>
  <div class="ddgl">
    <ResList tableId='0401' noEdit noAdd>
      <span slot="toolBar" class="newToolBar">
        <datePicker v-model="selectDate"/>
        <el-button style="margin-left:10px;" size="mini" @click="handleExport" type="primary" icon="el-icon-s-promotion">导出</el-button>
      </span>
    </ResList>
  </div>
</template>

<script>
import datePicker from '@/components/DatePicker'
export default {
  components:{
    datePicker
  },
  data(){
    return{
      selectDate: ''
    }
  },
  methods: {
    //导出
    handleExport() {
      this.$ajax.getBolb(this.$api.exportGRGSTJ,{
        date: this.selectDate
      }).then(res => {
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
<style lang="scss" scoped>
.newToolBar{
  position: absolute;
  margin-left: 100px;
  display: flex;
}
</style>
