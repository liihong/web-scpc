<template>
  <div class="ddDetail">
    <table class="detail-header">
      <tr>
        <td>
          <span class="big-big-font">订单编号：{{ ddData.xmname }}</span>
        </td>
        <td colspan="2">
          <div class="big-font">客户名称：{{ ddData.khmc }}</div>
        </td>
        <td colspan="2"
            style="text-align:right;padding-right:100px;">
          <div class="big-font">合同编号：{{ ddData.htbh }}</div>
        </td>
      </tr>
      <tr>
        <td>
          <div>
            <span class="small-font-name">开始时间</span>
            <span class="small-font-value">
              {{
              ddData.starttime
              }}
            </span>
          </div>
        </td>
        <td>
          <div>
            <span class="small-font-name">结束时间</span>
            <span class="small-font-value">{{ ddData.endtime }}</span>
          </div>
        </td>
        <td>
          <div>
            <span class="small-font-name">备注</span>
            <span class="small-font-value">{{ddData.remark}}</span>
          </div>
        </td>
        <td rowspan="2">
          <div class="flex">
            <div style="text-align:left;">
              <span style="display:block;">总工时</span>
              <span style="font-size: 24px;">{{ ddData.zgs }}</span>
            </div>
            <div style="width:150px;text-align:left;">
              <span style="display:block;">加工进度</span>
              <span style="font-size: 24px;">
                <el-progress :stroke-width="20"
                             :percentage="getBFB(ddData.dqjd,ddData.zgs)"></el-progress>
              </span>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <div>
            <span class="small-font-name">合同金额</span>
            <span class="small-font-value">{{ddData.htje}}</span>
          </div>
        </td>
        <td>
          <div>
            <span class="small-font-name">报价单金额</span>
            <span class="small-font-value">{{ddData.bjdzj}}</span>
          </div>
        </td>
        <td>
          <div>
            <span class="small-font-name">结款金额</span>
            <span class="small-font-value">{{ddData.jkje}}</span>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <span class="small-font-name">合同附件</span>
        </td>
        <td>
          <span class="small-font-name">报价单</span>
        </td>
        <td>
          <span class="small-font-name">订单图纸</span>
        </td>
      </tr>
      <tr>
        <td colspan="4">
          <div class="flex" style="justify-content: space-between;">
            <div>
              <div style="border-bottom: 0.5px solid #e6e6e6;">
                工艺排产工时：<span v-for="(item,index) in ddData.edgsTj"
                      :key="index"
                      class="inline-block">{{item.gymc}}</span>
              </div>
              <div style="border-bottom: 0.5px solid #e6e6e6;">
                额定(分钟)：
                <span v-for="(item,index) in ddData.edgsTj"
                      :key="index"
                      class="inline-block">{{item.zgs}}</span>
              </div>
              <div style="border-bottom: 0.5px solid #e6e6e6;">
                排产(分钟)：
                <span v-for="(item,index) in ddData.gstj"
                      :key="index"
                      class="inline-block">{{item.zgs}}</span>
              </div>
              <div style="border-bottom: 0.5px solid #e6e6e6;">
                额定(小时)：
                <span v-for="(item,index) in ddData.edgsTj"
                      :key="index"
                      class="inline-block">{{(item.zgs/60).toFixed(2)}}</span>
              </div>
              <div>
                排产(小时)：
                <span v-for="(item,index) in ddData.gstj"
                      :key="index"
                      class="inline-block">{{(item.zgs/60).toFixed(2)}}</span>
              </div>
            </div>
            <div>
            <bar-echarts style="width:500px;height:150px;"
                         :option="option" />
          </div>
          </div>
        </td>
      </tr>
    </table>
    <span class="content-name">零件加工进度({{sumCount}})</span>
    <div class="detail-content">
      <el-card class="box-card"
               v-for="(item,key) in statusList"
               :key="key">
        <div slot="header"
             class="clearfix">
          <el-tag type="success">{{item.MC}}</el-tag>
          <span style="float:right;">{{bomList[item.ID].length}}</span>
        </div>
        <div class="text item">
          <ul class="board-list">
            <li style="border-left: 4px solid rgb(254, 115, 0);"
                class="board-list-card"
                v-for="(el,i) in bomList[item.ID]"
                :key="i">
              <div class="list-title">{{el.ZDDMC}}</div>
              <div class="list-cz">{{el.ZDDCZ_TEXT}}</div>
              <div class="list-ddjd"
                   v-html="el.DQJQ">
                <!-- {{el.DQJQ}} -->
              </div>
            </li>
          </ul>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import barEcharts from "@/components/Echarts/barEcharts";

export default {
  components: {
    barEcharts,
  },
  data () {
    return {
      ddData: {},
      bomList: {},
      statusList: [],
      sumCount: 0,
      option: {
        legend: {},
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          axisTick: { show: false },
          data: []
        },
        yAxis: {
          type: 'log'
        },
        series: [
          { type: 'bar', name: '排产工时', data: [] },
          { type: 'bar', name: '额定工时', barGap: '10%', data: [] },
        ]
      }
    };
  },
  computed: {
    id () {
      return this.$route.query.id;
    }
  },
  created () {
    this.initData();
  },
  methods: {
    async initData () {
      let dd = await this.$ajax.get(this.$api.getDdDetail, { id: this.id });
      if (dd.errno == 0) {
        this.ddData = dd.data;

        this.option.xAxis.data = dd.data.edgsTj.map(v => v.gymc)
        this.option.series[1].data = dd.data.edgsTj.map(v => v.zgs)
        this.option.series[0].data = dd.data.gstj.map(v => v.zgs)
        this.$forceUpdate()
      }

      let query = {
        tableId: "0104",
        order: "",
        pageNumber: 1,
        pageSize: 100,
        query: { SSDD: this.$route.query.id }
      };

      let sjzd = await this.$ajax.get(this.$api.getSjzdById, { id: "05" });
      if (sjzd.errno == 0) {
        this.statusList = sjzd.data;
        this.statusList.map(el => {
          this.bomList[el.ID] = [];
        });
      }
      let bom = await this.$ajax.get(this.$api.queryTableData, query);
      if (bom.errno == 0) {
        let data = bom.data.data;
        this.sumCount = data.length
        data.map(item => {
          this.statusList.map(el => {
            if (item.ZDDZT == el.ID) {
              this.bomList[el.ID].push(item);
            }
          });
        });
        this.$forceUpdate();
      }
    },
    //获取订单百分比
    getBFB (dqjd = 0, zgs = 0) {
      let ddzgs = zgs || 0;
      let yjggs = dqjd || 0;
      if (yjggs * 1 == 0) {
        return 0;
      }
      if (ddzgs * 1 == 0) {
        return 0;
      }
      let bfb = (yjggs / ddzgs) * 100;

      return Math.ceil(bfb);
    }
  },
  watch: {
    bomList: {
      deep: true
    },
    '$route.query.id'(){
      if(this.$route.query.id){
        this.initData()
      }
    }
  }
};
</script>

<style lang="scss">
.box-card {
  .el-card__body {
    padding: 0 !important;
  }
}
.inline-block {
  display: inline-block;
  min-width: 70px;
  text-align: center;
}
</style>
<style lang="scss" scoped>
.ddDetail {
  margin: 20px;
  .detail-header {
    width: 100%;
    line-height: 32px;
  }
  .content-name {
    font-size: 14px;
    color: #27b39d;
    letter-spacing: 0.23px;
    border-bottom: 1px solid #27b39d;
    line-height: 32px;
  }
  .detail-content {
    display: flex;
    background: #eff2f5;
    justify-content: flex-start;
    max-height: calc(100vh - 320px);
    // max-width: calc(100vw - 200px);
    width: 100%;
    overflow: scroll;
  }
}
.box-card {
  height: max-content;
  margin: 5px;
  min-width: 250px;
  background: #f7f7f7;
  .board-list-card {
    max-width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    width: 290px;
    margin: 20px 0;
    padding: 0 5px;
    background: #ffffff;
    border: none;
    border-radius: 2px;
    transition: box-shadow 0.1s ease, transform 0.1s ease,
      -webkit-transform 0.1s ease;
    .list-title {
      color: #40485b;
      font-size: 16px;
    }
    .list-cz {
      color: rgba(0, 0, 0, 0.4);
      margin-left: 5px;
    }
    .list-ddjd {
      margin: 5px;
    }
  }
}

.flex {
  display: flex;
  justify-content: space-around;
  align-items: center;
  text-align: center;
}
.big-big-font {
  font-family: PingFangSC-Medium;
  font-size: 22px;
  color: #333333;
  letter-spacing: 0.29px;
}
.big-font {
  font-family: PingFangSC-Medium;
  font-size: 18px;
  color: #666666;
  letter-spacing: 0.29px;
}
.small-font-name {
  display: inline-block;
  width:70px;
  text-align: right;
  font-size: 12px;
  color: #666666;
  letter-spacing: 0.19px;
}
.small-font-value {
  font-family: PingFangSC-Medium;
  font-size: 14px;
  color: #333333;
  letter-spacing: 0.19px;
  margin-left: 10px;
}
</style>
