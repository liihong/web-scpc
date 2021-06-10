<template>
  <div>
    <ResList tableId='010413'
             :query="query"
             noEdit
             noAdd
             ref="zjryjy">
      <template slot="query">
        <el-form-item>
          <datePicker @sureBtnClick="handlerDateChange"
                    v-model="dateValue" />
        </el-form-item>
      </template>

    </ResList>
  </div>
</template>

<script>
import datePicker from '@/components/DatePicker'
export default {
  components:{
    datePicker
  },
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
      // this.dateValue = e
      this.query = {
        cksj: [e.split(' ')[0],e.split(' ')[1]]
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