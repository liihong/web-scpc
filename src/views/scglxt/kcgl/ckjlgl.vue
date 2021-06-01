<template>
  <div>
    <ResList tableId='010412' noAdd noEdit :query="this.$route.query" >
      <el-table-column slot="operate" fixed="left" label="操作" width="150" align="center">
      <template slot-scope="scope">
        <el-button-group>
          <el-button type="primary" @click="exportCKLog(scope.row)" class="radio" :label="1">导出出库记录</el-button>
        </el-button-group>
      </template>
    </el-table-column>
      </ResList>
  </div>
</template>

<script>
export default {
  methods:{
    exportCKLog(row){
      let params = {
        tableId: '010413',
        query: {ckid: row.id}
      }
      
      this.$ajax.getBolb(this.$api.exportExcel, params).then(res => {
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

<style>

</style>