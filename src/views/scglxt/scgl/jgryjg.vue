<template>
  <div class="jgryjg">
    <ResList tableId='010401' :query="query" noEdit noAdd ref="jgList">
      <el-table-column slot="operate" fixed="left" label="操作" min-width="80" align="center">
        <template slot-scope="scope">
          <el-button v-if="!scope.row.CZRYID" size="mini" type="primary" @click="beginWork(scope.row)">开始</el-button>
          <el-button v-if="scope.row.CZRYID" size="mini" type="warning" @click="endWork(scope.row)">结束</el-button>
        </template>
      </el-table-column>
      <template slot="SSDD" slot-scope="scope">
        <el-badge  v-show="!!scope.row.DDLEVEL" :value="scope.row.DDLEVEL == '0402' ? '重要' : scope.row.DDLEVEL == '0403' ? '' : '紧急'" class="item" :type="scope.row.DDLEVEL == '0402' ? 'warning' : scope.row.DDLEVEL == '0403' ? 'info' : 'danger'">
          <span style="margin:0 5px;">{{scope.row.SSDD_TEXT}}</span>
        </el-badge>
      </template>
      <template slot="BOMID" slot-scope="scope">
        <span class="spanText" @click="gybpClick(scope.row)">{{scope.row.BOMID_TEXT}}</span>
      </template>
      <template slot="GYNR" slot-scope="scope">
        <a v-if="!!scope.row.DDTZ" :href="scope.row.DDTZ" target="_blank">
          <span :style="{color:scope.row.CZRYID? 'red': ''}"> {{scope.row.GYNR_TEXT}}</span>
        </a>
        <span v-else :style="{color:scope.row.CZRYID? 'red': ''}"> {{scope.row.GYNR_TEXT}}</span>
        <i v-if="scope.row.CZRYID" class="ingIcon">
          <svg-icon icon-class="ing" />
        </i>
      </template>
    </ResList>
    <gybp :dialogState="dialogState" ref="gygx" />
    <selectPerson :dialogState="personState" />
    <overWork :dialogState="overState" />
  </div>
</template>

<script>
import gybp from '../jsgl/components/gygx'
import selectPerson from './components/selectPerson'
import overWork from './components/overWork'

import { mapGetters } from 'vuex'

export default {
  name: 'jgryjg',
  components: {
    gybp,
    selectPerson,
    overWork
  },
  data() {
    return {
      dialogState: {
        row: {},
        type: 'read',
        show: false
      },
      personState: {
        show: false,
        gyid: ''
      },
      overState: {
        show: false,
        gyid: ''
      }
    }
  },
  computed: {
    ...mapGetters(['fzgy']),
    query() {
      if (this.fzgy) {
        return { gynr: this.fzgy }
      }
    }
  },
  methods: {
    //显示工艺编排信息
    gybpClick(row) {
      this.dialogState.show = true
      this.dialogState.row = row
    },
    // 开始加工
    beginWork(row) {
      this.personState.gyid = row.ID
      this.personState.show = true
    },
    // 结束加工
    endWork(row) {
      this.overState.gyid = row.ID
      this.overState.worker = row.CZRYID
      this.overState.kjgjs = row.DJGJS * 1
      this.overState.ddjs = row.JGSL
      this.overState.show = true
    }
  }
}
</script>
<style>
.ingIcon {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 42px;
}
</style>
