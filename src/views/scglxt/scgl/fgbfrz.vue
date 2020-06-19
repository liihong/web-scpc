<template>
  <div class="fgbfrz">
    <div class="toolBar">
    </div>
    <el-tabs type="border-card">
      <el-tab-pane label="让步接收">
        <ResList noEdit noAdd tableId="0118" :query="{SJZT:2203}" />
      </el-tab-pane>
      <el-tab-pane label="返工">
        <ResList noEdit noAdd tableId="0118" :query="{SJZT:2201}" />
      </el-tab-pane>
      <el-tab-pane label="报废">
        <ResList noEdit noAdd ref="bflist" tableId="0118" :query="{SJZT:2202}">
          <template slot="toolBar">
            <el-button @click="handleAdd" icon="el-icon-warning" type="warning">手动报废</el-button>
          </template>
        </ResList>
      </el-tab-pane>
    </el-tabs>
    <addFgBf :dialogState="dialogState" />
  </div>
</template>

<script>
import addFgBf from './components/addFgBf'
export default {
  name:'fgbfrz',
  components:{
    addFgBf
  },
  data(){
    return {
      dialogState:{
        show:false,
        type:'bf'
      }
    }
  },
  methods:{
    handleAdd(){
      this.dialogState.show = true
    }
  }
};
</script>

<style>
.fgbfrz{
    margin:10px;
}
</style>
