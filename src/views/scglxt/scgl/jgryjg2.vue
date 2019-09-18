<template>
    <div>
        <div class="toolBar">
            <el-col :span="4">
                <el-input size="small" v-model="searchValue" placeholder="模糊查询"></el-input>
            </el-col>
        </div>
        <div class="data-list">
            <el-card class="box-card">
                <div slot="header" class="clearfix">
                    <span>卡片名称</span>
                </div>
                <div v-for="o in 4" :key="o" class="text item">
                    {{'列表内容 ' + o }}
                </div>
            </el-card>
        </div>
    </div>
</template>

<script>
import gybp from '../jsgl/components/gygx'
import selectPerson from './components/selectPerson'
import overWork from './components/overWork'

import { mapGetters } from 'vuex'
export default {
  components: {
    gybp,
    selectPerson,
    overWork
  },
  data() {
    return {
      searchValue: ''
    }
  },
  computed: {
    ...mapGetters(['fzgy']),
    query() {
      if (this.fzgy) {
        return { gynr: this.fzgy }
      }
    }
  }
}
</script>

<style>
</style>
