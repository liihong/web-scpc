<template>
  <div>
    <el-table class="el-table"
              :data="tableDatas"
              stripe
              border
              max-height="500px"
              style="width: 100%;">
      <el-table-column v-for="(row,index) in columnDatas"
                       :key="index"
                       :prop="row.id"
                       align="center"
                       :fixed="(row.frozen == 1?'left':false)"
                       :label="row.name"
                       :min-width="(row.length != '')?row.length:150">
        <template slot-scope="scope">
         
          <div v-if="row.id === 'dqjd'">
            <router-link :to="{path:'/ddDetail', query:{id:scope.row.id}}">
              <el-progress :text-inside="true"
                           :stroke-width="14"
                           :percentage="getBFB(scope.row.dqjd,scope.row.zgs)"></el-progress>
            </router-link>
          </div>
           <div v-else-if="row.id === 'xmname'">
            <router-link :to="{path:'/ddDetail', query:{id:scope.row.id}}">
              {{scope.row[row.id]}}
            </router-link>
          </div>
          <span v-else>{{scope.row[row.id]}}</span>

        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data () {
    return {
      columnDatas: [{
        id: 'htbh',
        name: '所属合同'
      }, {
        id: 'xmname',
        name: '订单编号'
      }, {
        id: 'remark',
        name: '订单备注'
      }, {
        id: 'jssj',
        name: '交货时间'
      }, {
        id: 'dqjd',
        name: '进度'
      }],
      tableDatas: []
    }
  },
  mounted () {
    this.initData()
  },
  methods: {
    initData () {
      this.$ajax.get(this.$api.getOrderList, {
        pageNumber: 1,
        pageSize: 100,
      }).then(res => {
        if (res.data) {
          this.tableDatas = res.data.data;
        }
      });
    },
    //获取订单百分比
    getBFB (dqjd = 0, zgs = 0) {
      let ddzgs = zgs || 0
      let yjggs = dqjd || 0
      if (yjggs * 1 == 0) {
        return 0
      }
      if (ddzgs * 1 == 0) {
        return 0
      }
      let bfb = (yjggs / ddzgs) * 100

      return Math.ceil(bfb)
    }
  }
}
</script>

<style>
</style>
