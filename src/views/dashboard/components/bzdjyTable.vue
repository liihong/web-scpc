<template>
  <div>
    <DataResList :tableData="tableData"
                 tableId='010403'
                 noEdit
                 noTool
                 noAdd>
      <template slot="DQJD"
                slot-scope="scope">
        <div style="text-align:left;"
             v-html="scope.row.DQJD"></div>
      </template>
    </DataResList>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import DataResList from '../../resMgr/ResDataList'

export default {
  components: {
    DataResList,
  },
  data () {
    return {
      tableData: {
      },
      query: {
        pageSize: 30,
        pageNumber: 1,
      },
    }
  },
  computed: {
    ...mapGetters(['fzgy'])
  },
  created () {
    this.initData()
  },
  methods: {
    async initData () {
      this.query.gynr = this.fzgy
      let res = await this.$ajax.post(this.$api.getCheckList, this.query)
      if (res.errno == 0) {
        this.tableData = res.data
      }
    }
  }
}
</script>

<style>
</style>