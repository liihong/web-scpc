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
      <template slot="DQJD" slot-scope="scope">
        <div style="text-align:left;" v-html="scope.row.DQJD"></div>
      </template>
    </ResList>
    <gybp :dialogState="dialogState" ref="gygx" />
    <selectPerson :dialogState="personState" />
    <selectBakStore v-if="bykState.show" :dialogState="bykState" /> 
    <overWork :dialogState="overState" />
    <el-dialog width="200px" :visible.sync="isBykShow" title="是否关联备用库">
      <el-radio v-model="isRelevance" label="1">关联备用库</el-radio>
      <el-radio v-model="isRelevance" label="2">不关联</el-radio><br/><br/>
      <el-button type="primary" @click="onSureRele">确定</el-button>
    </el-dialog>
  </div>
</template>

<script>
import gybp from '../jsgl/components/gygx'
import selectPerson from './components/selectPerson'
import selectBakStore from './components/selectBakStore' //选择备用库
import overWork from './components/overWork'

import { mapGetters } from 'vuex'

export default {
  name: 'jgryjg',
  components: {
    gybp,
    selectPerson,
    selectBakStore,
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
      },
      bykState:{
        show: false,
        row:{}
      },
      isBykShow: false,
      isRelevance:'1',
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
      this.bykState.row = row
      this.personState.gyid = row.ID
      console.log(row)
      if(row.GYNR === '201909111019399817')// 如果工艺内容是库存的话，则弹出关联备用库存窗口，其他则正常
      {
        this.isBykShow = true
        // this.bykState.show = true
      }else{
        this.personState.show = true
      }
    },
    onSureRele(){
      this.isBykShow = false
      if(this.isRelevance === '1')// 如果工艺内容是库存的话，则弹出关联备用库存窗口，其他则正常
      {
        this.bykState.show = true
      }else{
        this.personState.show = true
      }
    },
    // 结束加工
    endWork(row) {
      this.overState.gynr = row.GYNR
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
