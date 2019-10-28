<template>
  <ResList tableId='010403' :query="this.$route.query" noEdit noAdd @selectChange="getChecks" ref="zjryjy">
    <el-form-item slot="toolBar">
      <el-button type="primary" icon="el-icon-s-unfold" @click="passMany" class="radio" :label="1">批量通过</el-button>
    </el-form-item>
    <el-table-column slot="operate" fixed="left" label="操作" min-width="200" align="center">
      <template slot-scope="scope">
        <el-button-group>
          <el-button type="primary" @click="changeRadio(scope.row)" class="radio" :label="1">全部通过</el-button>
            <el-button type="warning" @click="passSection(scope.row)" class="radio" :label="2">部分通过</el-button>
            <el-button type="danger" @click="noPass(scope.row)" class="radio" :label="3">全部返工</el-button>
         </el-button-group>
      </template>
    </el-table-column>
    <template slot="SSDD" slot-scope="scope">
        <el-badge  v-show="!!scope.row.DDLEVEL" :value="scope.row.DDLEVEL == '0402' ? '重要' : scope.row.DDLEVEL == '0403' ? '' : '紧急'" class="item" :type="scope.row.DDLEVEL == '0402' ? 'warning' : scope.row.DDLEVEL == '0403' ? 'info' : 'danger'">
          <span style="margin:0 5px;">{{scope.row.SSDD_TEXT}}</span>
        </el-badge>
      </template>
    <!-- <template slot="ZDDJB" slot-scope="scope">
      <el-tag effect='dark' :type="scope.row.ZDDJB == '0402' ? 'warning' : scope.row.ZDDJB == '0403' ? '' : 'danger'">{{scope.row.ZDDJB_TEXT}}</el-tag>
    </template> -->
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
    passMany() {
      const vm = this
      this.$message.confirm('是否确定检验通过当前选中行', () => {
        let arr = []
        this.selectRows.map(item => {
          arr.push(
            this.$ajax.post(this.$api.gygxCheckPassAll, {
              gygcid: item.ID,
              jgryid: item.CZRYID,
              bomid: item.BOMID,
              bfjs: 0,
              serial: item.SERIAL
            })
          )
        })
        if (arr.length > 0) {
          Promise.all(arr).then(function() {
             vm.$message.success('批量操作成功！')
             vm.$refs.zjryjy.getResList()
          })
        }
      })
    },
    //部分通过
    passSection(row) {
      this.dialogState.type = 'part'
      this.dialogState.row = row
      this.dialogState.show = true
    },
    noPass(row) {
      this.dialogState.row = row
      this.dialogState.show = true
      this.dialogState.type = 'noPass'
    },
    changeRadio(row) {
      this.$message.confirm('是否确定全部检验通过', () => {
        this.$ajax
          .post(this.$api.gygxCheckPassAll, {
            gygcid: row.ID,
            jgryid: row.CZRYID,
            bomid: row.BOMID,
            bfjs: 0,
            serial: row.SERIAL
          })
          .then(res => {
            if (res.errno == 0) {
              this.$message.success('操作成功！')
              this.$refs.zjryjy.getResList()
            }
          })
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