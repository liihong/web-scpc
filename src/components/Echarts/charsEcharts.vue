<template>
  <div class="pieEcharts">
    <div class="echarts" :id="randomId"></div>
  </div>
</template>

<script>
require('echarts-wordcloud')
export default {
  name: 'wordCloud',
  props: ['wordData'],
  data() {
    return {
      randomId: 'pie-dom' + Date.now() + Math.random(),
      myEcharts: null
    }
  },
  methods: {
    initEcharts() {
      let $echartsDOM = document.getElementById(this.randomId)

      let myEcharts = this.$echarts.init($echartsDOM)
      this.myEcharts = myEcharts
      let option = {
        title: {},
        tooltip: {
          show: false
        },
        series: [
          {
            type: 'wordCloud',
            gridSize: 5,
            sizeRange: [13, 20],
            autoSize: {
              enable: true,
              minSize: 12
            },
            left: 'center',
            top: 'center',
            width: '100%',
            height: '100%',
            rotationRange: [0, 0],
            shape: 'circle',
            drawOutOfBound: false,
            textStyle: {
              normal: {
                color: function() {
                  return (
                    'rgb(' +
                    [
                      Math.round(Math.random() * 160),
                      Math.round(Math.random() * 160),
                      Math.round(Math.random() * 160)
                    ].join(',') +
                    ')'
                  )
                }
              },
              emphasis: {
                shadowBlur: 10,
                shadowColor: '#333'
              }
            },
            data: this.wordData
          }
        ]
      }
      if (option && typeof option === 'object') {
        myEcharts.clear()
        myEcharts.setOption(option, true)
      }
    }
  },
  mounted() {
    const that = this
    that.initEcharts()
    setTimeout(function() {
      that.myEcharts.resize()
    }, 400)
    window.addEventListener(
      'resize',
      () =>
        setTimeout(function() {
          that.myEcharts.resize()
        }, 400),
      false
    )
  },
  watch: {
    wordData() {
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
.pieEcharts {
  position: relative;
  height: 100%;
}
.wrap-container,
.echarts {
  height: 459 * @base;
  margin-right: 15px;
  background: #ffffff;
}
</style>
