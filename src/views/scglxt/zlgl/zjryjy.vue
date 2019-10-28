<template>
  <ResList tableId='010407' :query="this.$route.query" noEdit noAdd @selectChange="getChecks" ref="zjryjy">
    <el-form-item slot="toolBar">
      <el-button type="primary" icon="el-icon-s-unfold" @click="passMany" class="radio" :label="1">批量通过</el-button>
    </el-form-item>
    <el-table-column slot="operate" fixed="left" label="操作" min-width="170" align="center">
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
    <template slot="SSDD" slot-scope="scope">
      <el-badge v-show="!!scope.row.ZDDJB" :value="scope.row.ZDDJB == '0402' ? '重要' : scope.row.ZDDJB == '0403' ? '' : '紧急'" class="item" :type="scope.row.ZDDJB == '0402' ? 'warning' : scope.row.ZDDJB == '0403' ? 'info' : 'danger'">
        <span style="margin:0 5px;">{{scope.row.SSDD_TEXT}}</span>
      </el-badge>
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
        .post(this.$api.BOMFinallyCheck, {
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
      this.$message.confirm('是否确定检验通过当前选中行', () => {
        let arr = []
        this.selectRows.map(item => {
          arr.push(item.ID)
        })
        if (arr.length > 0) {
          this.$ajax
            .post(this.$api.BOMFinallyCheck, {
              id: arr.join(',')
            })
            .then(function() {
              vm.$message.success('批量操作成功！')
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