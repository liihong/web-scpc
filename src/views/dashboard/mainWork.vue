<template>
    <div class="dashboard-container">
        <statistics />
        <el-row :gutter="20" style="height:50vh">
            <el-col>
                <el-card class="box-card">
                    <div slot="header" class="clearfix">
                        <span>订单进度</span>
                    </div>
                    <ddTable/>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import statistics from './components/statistics.vue'
import ddTable from './components/ddTable.vue'
export default {
  name: 'mainWork',
  components: {
    statistics,
    ddTable
  },
  computed: {
    ...mapGetters(['name', 'roles'])
  },
  data() {
    return {
    }
  },
  mounted() {},
  methods: {}
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard {
  &-container {
    padding: 10px;
    background-color: #f0f2f5;
    .projectAll {
      display: flex;
    }
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
