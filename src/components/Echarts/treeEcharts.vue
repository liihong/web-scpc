<template>
  <div class="treeEcharts">
    <div v-show="isDisplay" :style="{height: option.height,width: option.width}" class="echarts" :id="randomId"></div>
    <div class="echarts noNum" v-show="!isDisplay">
      <span>暂无数据</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'treeEcharts',
  props: ['title', 'option', 'treeData'],
  data() {
    return {
      randomId: 'pie-dom' + Date.now() + Math.random(),
      myEcharts: null
    }
  },
  mounted() {
    const that = this
    that.initEcharts()
    window.addEventListener(
      'resize',
      () =>
        setTimeout(function() {
          that.myEcharts.resize()
        }, 400),
      false
    )
  },
  computed: {
    isDisplay() {
      if (
        (this.treeData && this.treeData.length > 0) ||
        (this.option && this.option.series && this.option.series.length > 0)
      ) {
        if (
          this.option.series[0].data &&
          this.option.series[0].data.length > 0
        ) {
          return true
        }
        return false
      } else {
        return false
      }
    }
  },
  methods: {
    initEcharts() {
      let $echartsDOM = document.getElementById(this.randomId)
      let vm = this
      let myEcharts = this.$echarts.init($echartsDOM)
      let options = {
        title: {
          text: this.title,
          textStyle: {
            color: 'rgba(0,0,0,0.70)',
            fontSize: 30,
            align: 'center'
          },
          x: 'center',
          y: 'center'
        },
        color: ['#004EA2', '#F08600', '#E838B48'],
        tooltip: {},
        legend: {
          show: false
        },
        series: [
          {
            name: '',
            type: 'pie',
            radius: ['50%', '50%'],
            center: ['50%', '50%'],
            data: this.treeData,
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      myEcharts.clear()
      if (this.option) {
        options = Object.assign(options, this.option)
      }
      myEcharts.setOption(options, true)
      this.myEcharts = myEcharts
      myEcharts.resize()
    }
  },
  watch: {
    treeData() {
      const that = this
      that.$nextTick(function() {
        this.initEcharts()
        setTimeout(function() {
          that.myEcharts.resize()
        }, 400)
      })
    },
    option() {
      const that = this
      that.$nextTick(function() {
        this.initEcharts()
        setTimeout(function() {
          that.myEcharts.resize()
        }, 400)
      })
    }
  }
}
</script>
<style lang="less" scoped>
.treeEcharts {
  position: relative;
  display: flex;
  justify-content: center;
}
.wrap-container,
.echarts {
  width:100%;
  height: 100%;
  background: #ffffff;
}
.noNum {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
