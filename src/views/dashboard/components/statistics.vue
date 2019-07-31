<template>
    <el-row :gutter="40" class="panel-group">
        <el-col :xs="14" :sm="14" :lg="8" class="card-panel-col">
            <div class="card-panel">
                <div class="card-panel-icon-wrapper icon-money">
                    <svg-icon icon-class="documentation" class-name="card-panel-icon" />
                    <div class="card-panel-description">
                        <div class="card-panel-text">订单总数</div>
                        <count-to :start-val="0" :end-val="basicInfo.ddTotal" :duration="400" class="card-panel-num" />
                    </div>
                </div>
                <div class="card-panel-detail">
                    <div>未开始
                        <span>{{basicInfo.ddNoStart}}</span>
                    </div>
                    <div>进行中
                        <span>{{basicInfo.ddInProcess}}</span>
                    </div>
                    <div>已完成
                        <span>{{basicInfo.ddIsFinish}}</span>
                    </div>
                </div>
            </div>
        </el-col>
        <el-col :xs="14" :sm="14" :lg="8" class="card-panel-col">
            <div class="card-panel">
                <div class="card-panel-icon-wrapper icon-shoppingCard">
                    <svg-icon icon-class="message" class-name="card-panel-icon" />
                    <div class="card-panel-description">
                        <div class="card-panel-text">BOM总数</div>
                        <count-to :start-val="0" :end-val="basicInfo.bomTotal" :duration="600" class="card-panel-num" />
                    </div>
                </div>

                <div class="card-panel-detail">
                    <div>未开始
                        <span>{{basicInfo.bomNoStart}}</span>
                    </div>
                    <div>进行中
                        <span>{{basicInfo.bomInProcess}}</span>
                    </div>
                    <div>已完成
                        <span>{{basicInfo.bomIsFinish}}</span>
                    </div>
                </div>
            </div>
        </el-col>
        <el-col :xs="14" :sm="14" :lg="8" class="card-panel-col">
            <div class="card-panel">
                <div class="card-panel-icon-wrapper icon-message">
                    <svg-icon icon-class="peoples" class-name="card-panel-icon" />
                    <div class="card-panel-description">
                        <div class="card-panel-text">员工总数</div>
                        <count-to :start-val="0" :end-val="basicInfo.peopleTotal" :duration="600" class="card-panel-num" />
                    </div>
                </div>
            </div>
        </el-col>

    </el-row>
</template>

<script>
import CountTo from 'vue-count-to'

export default {
  components: {
    CountTo
  },
  data(){
      return {
          basicInfo: {}
      }
  },
  created(){
      this.initData()
  },
  methods: {
      initData(){
          this.$ajax.get(this.$api.getStatistics).then(res=>{
              if(res.errno == 0){
                  this.basicInfo = res.data
                  console.log(this.basicInfo)
              }
          })
      }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.panel-group {
  margin-top: 18px;
  .card-panel-col {
    margin-bottom: 32px;
  }
  .card-panel {
    display: flex;
    justify-content: space-around;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.05);
    // &:hover {
    //   .card-panel-icon-wrapper {
    //     color: #fff;
    //   }
    //   .icon-people {
    //     background: #40c9c6;
    //   }
    //   .icon-message {
    //     background: #36a3f7;
    //   }
    //   .icon-money {
    //     background: #f4516c;
    //   }
    //   .icon-shoppingCard {
    //     background: #34bfa3;
    //   }
    // }
    .icon-people {
      color: #40c9c6;
    }
    .icon-message {
      color: #36a3f7;
    }
    .icon-money {
      color: #f4516c;
    }
    .icon-shoppingCard {
      color: #34bfa3;
    }
    .card-panel-icon-wrapper {
      margin: 14px 0 0 14px;
      padding: 16px;
      text-align: center;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }
    .card-panel-icon {
      font-size: 48px;
    }
    .card-panel-description {
      font-weight: bold;
      margin: 10px;
      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }
      .card-panel-num {
        font-size: 20px;
      }
    }

    .card-panel-detail {
      font-size: 14px;
      display: grid;
      margin: 14px 0 0 14px;
      padding: 16px;
      div {
        display: flex;
        align-items: center;
        span {
          margin-left: 10px;
          font-size: 20px;
          font-weight: 500;
        }
      }
    }
  }
}
</style>
