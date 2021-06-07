<template>
  <div>
    <ResList tableId='010413'
             :query="query"
             noEdit
             noAdd
             ref="zjryjy">
      <template slot="query">
        <el-form-item label="出库时间">
          <el-date-picker v-model="dateValue"
                          @change="handlerDateChange"
                          format="yyyy-MM-DD"
                          value-format="yyyy-MM-DD"
                          type="daterange"
                          range-separator="至"
                          start-placeholder="开始日期"
                          end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
      </template>

    </ResList>
  </div>
</template>

<script>
export default {
  data () {
    return {
      selectRows: [],
      dateValue: '',
      query: {
        cksj: ''
      }
    }
  },
  methods: {
    handlerDateChange (e) {
      console.log(e)
      this.dateValue = e
      this.query = {
        cksj: e
      }
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