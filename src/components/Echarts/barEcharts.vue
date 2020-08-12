<template>
  <div class="echarts-container">
    <div class="wrap-container">
      <div v-show="isDisplay"
           class="echarts"
           :id="randomId"></div>
      <div class="echarts noNum"
           v-if="!isDisplay">
        <span>暂无数据</span>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import $echarts from 'echarts'
export default {
  props: {
    option: {
      default () {
        return {
        }
      }
    },
    /**
     * 用于绑定滚动监听的 DOM 元素的 ID 值，不传递时会使用 window
     */
    scrollDomId: {
      default: null
    }
  },
  data () {
    return {
      /**
       * 为该组件生成具有唯一 ID DOM
       */
      randomId: 'bar-dom' + Date.now() + Math.random()
    }
  },
  mounted () {
    /**
     * 获取 ehcarts 挂载元素
     */
    let $echartsDOM = document.getElementById(this.randomId)

    if (!$echartsDOM) {
      return
    }

    let myEcharts = $echarts.init($echartsDOM)

    myEcharts.on('click', params => {
      this.echartsClicked(params)
    })
    this.myEcharts = myEcharts
    /**
     * 初始化时进行一次检测
     */
    this.checkPosition()

    /**
     * 对滚动事件进行监控
     */
    this.onScrollDOM.addEventListener('scroll', this.scrollEvent)

    /**
     * 对浏览器窗口大小改变进行监控
     */
    window.addEventListener(
      'resize',
      _.throttle(() => {
        this.myEcharts.resize()
      }, this.windowResizeThrottle)
    )
  },
  methods: {
    _initCharts () {
      let baseOption = {
        title: {
          text: '',
          padding: [10, 10, 10, 24],
          textStyle: {
            rich: {
              a: {
                color: '#919CB5',
                fontSize: 17
              },
              b: {
                color: '#919CB5',
                fontSize: 15
              }
            },
            fontWeight: 'normal',
            left: '15%',
            color: '#919cb5'
          }
        },
        grid:{
          top: 20,
          bottom: 20
        },
        tooltip: {
          show: true, // 不显示鼠标hover事件的线
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            textStyle: {
              color: '#fff'
            }
          }
        },
        toolbox: {
          show: true
        },
        legend: {
          icon: 'roundRect',
          padding: [10, 20, 0, 0],
          right: 3,
          textStyle: {
            color: '#919CB5',
            fontSize: 14
          }
        },
        barWidth: '18',
        color: ['#FFC354', '#5D98E2','#EE8181','#4f89ef','#ffc642', '#0040a3','#00bed1','#00d543','#c082ed','#64c97b','#557eeb','#df5259'],
        xAxis: [
          {
            type: 'category',
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: '#919CB5'
              }
            },
            axisLabel: {
              show: true,
              interval: 0,
              color: '#919CB5',
              fontSize: 14
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: '#919CB5'
              }
            },
            axisLabel: {
              formatter: '{value}',
              color: '#919CB5',
              fontSize: 14
            }
          }
        ]
      }

      let options = Object.assign(baseOption, this.option)
      this.checkAndSetOption(options)
    },
    /**
     * 检测窗口滚动位置
     * 用以进行延迟加载
     */
    checkPosition () {
      let windowHeight =
        document.documentElement.clientHeight || window.innerHeight
      let scrollTop =
        this.onScrollDOM.scrollTop ||
        document.documentElement.scrollTop ||
        document.body.scrollTop
      let windowBottom = +scrollTop + +windowHeight
      let selfTop = _.get(this.$refs, 'selfEcharts.offsetTop', 0)
      if (windowBottom >= selfTop) {
        this.isPositionReady = true
        this._initCharts()
        window.removeEventListener('scroll', this.scrollEvent)
      }
    },
    /**
     * 对 option 进行检测
     * 并进行 setOption
     */
    checkAndSetOption (option) {
      if (this.isPositionReady !== true) return
      if (!this.isValidOption(option)) {
        this.myEcharts.clear()
        this.myEcharts.setOption(option, true)
        this.isOptionAbnormal = false
      } else {
        this.isOptionAbnormal = true
      }
    },
    isValidOption (option) {
      let flag = true
      if (
        Object.keys(option).length === 0 ||
        !!option['series'] ||
        option['series'].length === 0
      ) {
        flag = false
      }
      return flag
    }
  },
  computed: {
    /**
     * 获取可滚动的 DOM 元素
     * @returns {Window}
     */
    onScrollDOM () {
      let scrollDom = window
      if (this.scrollDomId !== null) {
        let tempDom = document.querySelector('#' + this.scrollDomId)
        if (tempDom !== null) {
          scrollDom = tempDom
        }
      }
      return scrollDom
    },
    isChartVisible () {
      return !this.isLoading && !this.isOptionAbnormal
    },
    isDisplay () {
      if (this.option.series && this.option.series.length > 0) {
        return true
      } else {
        return false
      }
    }
  },
  watch: {
    option: {
      deep: true,
      handler () {
        const that = this
        that.$nextTick(function () {
          this._initCharts()
          setTimeout(function () {
            that.myEcharts.resize()
          }, 400)
        })
      }
    }
  }
}
</script>
<style scoped>
.echarts-container {
  position: relative;
}

.wrap-container,
.loading,
.shadow {
  position: absolute;
}

.wrap-container,
.echarts {
  width: 100%;
  height: 100%;
}
.noNum {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
