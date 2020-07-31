<template>
    <div class="datePicker">
        <h1>{{title}}：</h1>
        <span class="pointer" @click='changeDate(item)' v-for='(item,index) in per' :key='index' v-html='item.name' :class='item.active?"active":""'></span>
        <div class='m-l-md goods-mdate'>
            <span>自定义</span>
            <el-date-picker value-format="yyyy-MM-dd" align="right" v-model="selectValue" @focus="onFocus" :clearable='false' type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
            </el-date-picker>
            <el-button type="primary" size='small' class='goods-btn' @click='emitSelectDate'>确定</el-button>
        </div>
    </div>
</template>
<script>
import { getNowFormatDate, addDate } from '../../utils/index.js'
export default {
  props: {
    title: {
      type: String,
      default: '统计时间'
    },
    value: {
        type: String
    }
  },
  data() {
    let o = {}
    o.selectValue = this.getDa(-0)
    o.per = [
      { name: '实时', id: 0, value: this.getDa(-0), active: true },
      { name: '近7天', id: 1, value: this.getDa(-6), active: false },
      { name: '近1月', id: 2, value: this.getDa(-30), active: false },
      { name: '近半年', id: 3, value: this.getDa(-182), active: false }
    ]
    return o
  },
  model:{
      prop:'value',
      event: 'sureBtnClick'
  },
  methods: {
    changeDate: function(it) {
      let vm = this
      vm.per.map(function(item) {
        item.active = false
      })
      it.active = true
      vm.selectValue = it.value
      this.$emit(
        'sureBtnClick',
        this.selectValue ? this.selectValue.join(' ') : this.selectValue
      )
    },
    onFocus() {
      this.per.map(function(item) {
        item.active = false
      })
    },
    emitSelectDate() {
      this.$emit(
        'sureBtnClick',
        this.selectValue ? this.selectValue.join(' ') : this.selectValue
      )
    },
    getDa: function(n) {
      let cur = getNowFormatDate()
      let last = addDate(cur, n)
      return [last, cur]
    }
  },
  mounted() {
    this.$emit(
      'sureBtnClick',
      this.selectValue ? this.selectValue.join(' ') : this.selectValue
    )
  },
  watch: {
    selectValue() {
    }
  }
}
</script>
<style lang="scss" scoped>
.datePicker {
  display: flex;
  align-items: center;
  .goods-mdate {
    border: 1px #d8d8d8 solid;
    padding: 2px 10px;
    border-radius: 4px;
    span {
      margin: 0 20px;
    }
  }
  span {
    margin-left: 20px;
    color: #666666;
  }
  span:last-child {
    margin-right: 10px;
  }
  .active {
    color: #42b983;
  }
}
</style>
