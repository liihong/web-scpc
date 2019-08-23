<template>
  <div class="mapEcharts" style="height: 500px;margin: 10px 20px;border: 1px solid #ccc">
    <div class="echarts" :id="randomId"></div>
  </div>
</template>

<script>
import worldJson from 'echarts/map/json/world.json'
import nameMap from '@/assets/js/nameMap.js'
export default {
  name: 'mapEcharts',
  props: ['title', 'option', 'mapData', 'beijing'],
  data() {
    return {
      randomId: 'map-dom' + Date.now() + Math.random(),
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
  computed: {},
  methods: {
    initEcharts() {
       const that = this
      let myData = []
      // let chinaData = [{ name: '中国', value: [116.46, 38.32, 123],symbol: 'image://http://172.16.199.31:8081/img/postion.svg', }]
      // let newArr = this.mapData.slice(0)
      // let myData = newArr.filter(item=>{
      //   return item.name == '中国'
      // })
      let coords = []
      this.mapData.map(item => {

        if(item.name == '中国') {
          // myData.push({
          //   name: item.name,
          //   value: [item.lat, item.log, item.value],
          //   symbolSize: 25,
          //   // symbol: 'image://http://172.16.199.31:8081/img/postion.svg',
          //   symbol: 'path://M1077.529145 388.206248C1072.06379 371.533456 1056.511742 360.326019 1039.008769 360.326019L686.956883 360.326019 578.16172599 27.824884C572.876243 11.207437 557.37954 0 539.765877 0 522.262904 0 506.71085601 11.207437 501.370028 27.700357L392.450343 360.326019 40.467639 360.326019C22.909321 360.326019 7.398781 371.533456 2.002608 388.206248-3.462747 404.713004 2.528389 422.963139 16.682967 433.119014L301.504067 638.533348 192.764255 971.214355C187.243555 987.776457 193.234691 1005.860556 207.444614 1016.127121 221.474665 1026.338342 240.845544 1026.338342 254.944776 1016.127121L539.765877 810.588261 824.642322 1016.127121C831.629675 1021.19122299 839.972989 1023.820128 848.371649 1023.820128 856.701127 1023.820128 865.099787 1021.191223 872.142485 1016.127121 886.297062 1005.860556 892.288199 987.776457 886.767498 971.21435499L778.138377 638.533348 1062.793441 433.119014C1076.934183 422.963139 1082.86997401 404.713004 1077.529145 388.206248Z',
          //    itemStyle: {
          //       areaColor: 'yellow',
          //       color: 'yellow'
          //     }
          // })
        } else {
          // myData.push({
          //   name: item.name,
          //   value: [item.lat, item.log, item.value]
          // })
        }

        // coords.push({
        //   fromName: '中国',
        //   toName: item.name,
        //   coords: [chinaData[0].value, [item.lat, item.log, item.value]]
        // })
      })
      // let maxValue = this.$util.getMaxByAttr(this.mapData, 'value')
      let $echartsDOM = document.getElementById(this.randomId)
      let myEcharts = this.$echarts.init($echartsDOM)

      let options = {
        tooltip: {
          trigger: 'item',
          formatter: function(res) {
            if (res.seriesType == 'lines') {
              return res.data.fromName + '-' + res.data.toName
            } else if (res.seriesType == 'map') {
              if (res.data) return res.data.name + '：' + res.data.value + '人'
            } else {
              if (res.data)
                return res.data.name + '：' + res.data.value[2] + '人'
            }
          }
        },
        //左侧小导航图标
        visualMap: [
          // {
          //   id: '1',
          //   min: 0,
          //   max: 18000,
          //   show: false,
          //   seriesIndex: 0,
          //   left: 100,
          //   type: 'continuous',
          //   realtime: false,
          //   calculable: true,
          //   inRange: {
          //     color: ['#ED6137', '#FEE58C']
          //   }
          // },
          {
            id: '2',
            min: 0,
            max: 1000,
            seriesIndex: 2,
            type: 'continuous',
            realtime: false,
            calculable: true,
            inRange: {
              color: ['#6DB0F0', '#3400E1']
            }
          }
        ],
        geo: {
          map: 'world',
          roam: true,
          id: 1,
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          boundingCoords: [
            // 定位左上角经纬度
            [-180, 90],
            // 定位右下角经纬度
            [180, -90]
          ],
          regions: [
            // {
            //   name: '中国',
            //   selected: true,
            //   itemStyle: {
            //     areaColor: 'red',
            //     color: 'red'
            //   },
            //   emphasis: {
            //     itemStyle: {
            //       areaColor: 'red',
            //       color: 'red'
            //     }
            //   }
            // }
          ],
          nameMap: nameMap
        },
        series: [
          {
            id: '1',
            name: '点', // series名称
            type: 'effectScatter', // series图表类型
            coordinateSystem: 'geo', // series坐标系类型
            // symbol:
            //   'path://M8,22 C9.83932022,17.5444601 16,13.0768664 16,8.42427038 C16,3.77167432 12.418278,0 8,0 C3.581722,0 -8.8817842e-15,3.77167432 -8.8817842e-15,8.42427038 C-8.8817842e-15,13.0768664 7.23728855,18.4504463 8,22 Z',
            // symbol: 'image://http://172.16.199.31:8081/img/postion.svg',
            symbolSize: 6,
            label: {
              normal: {
                formatter: '{b}',
                position: 'right',
                show: false
              },
              emphasis: {
                show: true
              }
            },
            itemStyle: {
              normal: {
                color:'#ED6137'
              }
            },
            data: myData
          },
          {
            name: '线', // series名称
            type: 'lines', // series图表类型
            coordinateSystem: 'geo', // series坐标系类型
            symbolSize: 10,
            lineStyle: {
              normal: {
                width: 2,
                type: 'dotted',
                color: '#800'
              }
            },
            data: coords
          },
          {
            name: '数据',
            type: 'map',
            mapType: 'world',
            geoIndex: 0,
            nameMap: nameMap,
            roam: true,
            label: {
              normal: {
                show: false //省份名称
              },
              emphasis: {
                show: false
              }
            },
            itemStyle: {
              normal: { label: { show: true } },
              emphasis: {
                label: { show: true },
                areaColor: '#eeeeee'
              }
            },
            data: [
              ...this.mapData
              // {
              //   name: '中国',
              //   selected: false,
              //   value: 10000
              // }
            ]
          }
        ]
      }
      this.$echarts.registerMap('world', worldJson)
      myEcharts.setOption(options, true)
      window.onresize = myEcharts.resize
      this.myEcharts = myEcharts
      this.myEcharts.on('click', function(params) {
        let name = params.data.name
        that.$emit('changeEcharts',name)
        // that.$router.push({
        //   path: 'search',
        //   query: { country: name }
        // })
      })
    }
  },
  watch: {
    mapData() {
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
.mapEcharts {
  position: relative;
  width: inherit;
}
.wrap-container,
.echarts {
  width: 100%;
  height: 100%;
  background: #ffffff;
}
</style>
