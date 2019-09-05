<template>
  <ResList tableId='010408' :query="this.$route.query" noEdit ref="zjryjy">
    <el-table-column slot="operate" fixed="left" label="操作" min-width="200" align="center">
      <template slot-scope="scope">
        <el-button-group>
          <el-button type="primary" @click="pass(scope.row)" class="radio" :label="1">通过并入库</el-button>
          <el-button type="danger" @click="passSection(scope.row)" class="radio" :label="2">不通过</el-button>
        </el-button-group>
      </template>
    </el-table-column>
    <template slot="XMNAME" slot-scope="scope">
      <router-link style="color:#48b884;" :to="{path: 'bomgl', query: {SSDD: scope.row.ID, SSHT: scope.row.SSHT}}">{{scope.row.XMNAME}}</router-link>
    </template>
    <template slot="DDLEVEL" slot-scope="scope">
      <el-tag effect='dark' :type="scope.row.DDLEVEL == '0402' ? 'warning' : scope.row.DDLEVEL == '0403' ? '' : 'danger'">{{scope.row.DDLEVEL_TEXT}}</el-tag>
    </template>
  </ResList>
</template>

<script>
export default {
methods: {
    //终检通过
    pass(row) {
      this.$ajax
        .post(this.$api.BOMInStore, {
          id: row.ID
        })
        .then(res => {
          if (res.errno == 0) {
            this.$message.success('全部通过成功！')
            this.$refs.zjryjy.getResList()
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