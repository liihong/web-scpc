<template>
  <div class="main-container">
    <div class="wrap-container">
      <div v-show="isDisplay" class="echarts" :id="randomId"></div>
      <div class="echarts noNum" v-show="!isDisplay">
        <span>暂无数据</span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'lineEcharts',
  props: ['title', 'option', 'lineData'],
  data() {
    return {
      randomId: 'line-dom' + Date.now() + Math.random(),
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
        (this.lineData && this.lineData.length > 0) ||
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
        grid: {
          // left: 'left',
          // right: '5%',
          // bottom: '3%'
        },
        // color: ['#EB0610', '#FB7927'],
        tooltip: {},
        legend: {
          show: false
        },
        // visualMap: {
        //   show: false,
        //   inRange: {
        //     color: ['#EB0610', '#FB7927', 'red'],
        //   }
        // },
        series: [
          {
            type: 'line',
            smooth: true,
            symbol: 'none',
            data: this.lineData
          }
        ]
      }
      myEcharts.clear()
      if (this.option) {
        options = Object.assign(options, this.option)
      }
      myEcharts.setOption(options, true)
      this.myEcharts = myEcharts
      window.onresize = myEcharts.resize
      myEcharts.resize()
        const that = this
      if(this.option.series[0].name == '关键议题' || this.option.series[0].name == '新闻统计') {
        myEcharts.on('click', function(params) {
        let name = params.name
        let id = params.data.properties
        that.$router.push({
          path: '/textTableFac',
          query: { yt: name,peopleId: id,peopleName: params.data.peopleName }
        })
      })
      } else if(this.option.series[0].name == '人物身份统计') {
        this.myEcharts.on('click', function(params) {
        let name = params.name
        let id = params.data.properties
        that.$router.push({
          path: '/search',
          query: { type: name,peopleId: id,peopleName: params.data.peopleName }
        })
        })
      }
    }
  },
  watch: {
    lineData() {
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
<style>
.main-container {
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
