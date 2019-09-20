<template>
  <ResList tableId='010408' :query="this.$route.query"  @selectChange="getChecks" noEdit noAdd ref="zjryjy">
     <el-form-item slot="toolBar">
      <el-button type="primary" icon="el-icon-s-unfold" @click="passMany" class="radio" :label="1">批量通过</el-button>
    </el-form-item>
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
    <template slot="ZDDJB" slot-scope="scope">
      <el-tag effect='dark' :type="scope.row.ZDDJB == '0402' ? 'warning' : scope.row.ZDDJB == '0403' ? '' : 'danger'">{{scope.row.ZDDJB_TEXT}}</el-tag>
    </template>
  </ResList>
</template>

<script>
export default {
  data() {
    return {
      selectRows: []
    }
  },
  methods: {
    getChecks(sel) {
      this.selectRows = sel
    },
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
    },
    passMany() {
      const vm = this
      this.$message.confirm('是否确定', () => {
        let arr = []
        this.selectRows.map(item => {
          arr.push(item.ID)
        })
        if (arr.length > 0) {
          this.$ajax
            .post(this.$api.BOMInStore, {
              id: arr.join(',')
            })
            .then(function() {
              vm.$message.success('批量入库成功！')
              vm.$refs.zjryjy.getResList()
            })
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