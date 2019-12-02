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
        <td>
          <div class="big-font">合同编号：{{ ddData.htbh }}</div>
        </td>
      </tr>
      <tr>
        <td>
          <div>
            <span class="small-font-name">开始时间</span><span class="small-font-value">{{
              ddData.starttime
            }}</span>
          </div>
        </td>
        <td>
          <div>
            <span class="small-font-name">结束时间</span><span class="small-font-value">{{ ddData.endtime }}</span>
          </div>
        </td>
        <td>
          <div><span class="small-font-name">备注</span><span class="small-font-value">12312</span></div>
        </td>
        <td rowspan="2" style="width:600px;">
          <div class="flex">
            <div>
              <span style="display:block;">总工时</span>
              <span style="font-size: 24px;">{{ ddData.zgs }}</span>
            </div>
            <div style="width:200px;">
              <span style="display:block;">加工进度</span>
              <span style="font-size: 24px;">
                <el-progress :stroke-width="20" :percentage="getBFB(ddData.dqjd,ddData.zgs)"></el-progress>
              </span>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <div><span class="small-font-name">合同金额</span><span class="small-font-value">{{ddData.htje}}</span></div>
        </td>
        <td>
          <div><span class="small-font-name">报价单金额</span><span class="small-font-value">{{ddData.bjdzj}}</span></div>
        </td>
        <td>
          <div><span class="small-font-name">结款金额</span><span class="small-font-value">{{ddData.jkje}}</span></div>
        </td>
      </tr>
      <tr>
        <td><span class="small-font-name">合同附件</span></td>
        <td><span class="small-font-name">报价单</span></td>
        <td><span class="small-font-name">订单图纸</span></td>
      </tr>
      <tr>
        <td colspan="4">
          工时统计：
          <span v-for="(item,index) in ddData.gstj" :key="index">{{item.gymc}}({{item.zgs}})-</span>
        </td>
      </tr>
    </table>
    <span class="content-name">零件加工进度</span>
    <div class="detail-content">
      <el-card class="box-card" v-for="(item,key) in bomList" :key="key">
        <div slot="header" class="clearfix">
          <span>{{item.ZDDMC}}</span>
          <el-tag type="success">{{item.ZDDZT_TEXT}}</el-tag>
        </div>
        <div class="text item">
          <span v-html="item.DQJQ"></span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ddData: {},
      bomList: []
    }
  },
  computed:{
    id(){
      return this.$route.query.id
    }
  },
  created() {
    this.initData()
  },
  methods: {
    async initData() {
      let dd = await this.$ajax.get(this.$api.getDdDetail, { id: this.id })
      if (dd.errno == 0) {
        this.ddData = dd.data
      }

      let query = {
        tableId: '0104',
        order: '',
        pageNumber: 1,
        pageSize: 100,
        query: {"SSDD":this.$route.query.id}
      }
      let bom = await this.$ajax.get(this.$api.queryTableData,query)
      if(bom.errno == 0)
        this.bomList = bom.data.data
    },
     //获取订单百分比
    getBFB(dqjd = 0, zgs = 0) {
      let ddzgs = zgs || 0
      let yjggs = dqjd || 0
      if (yjggs*1 == 0) {
        return 0
      }
      if (ddzgs*1 == 0) {
        return 0
      }
      let bfb = (yjggs / ddzgs) * 100

      return Math.ceil(bfb)
    }
  }
}
</script>

<style lang="scss" scoped>
.ddDetail {
  .detail-header {
    width: 100%;
    line-height: 32px;
  }
  .content-name{
    font-size: 14px;
    color: #27B39D;
    letter-spacing: 0.23px;
    border-bottom: 1px solid #27B39D;
    line-height: 32px;
  }
  .detail-content {
    display: flex;
    background: #EFF2F5;
    flex-wrap: wrap;
    justify-content: flex-start;
    height: 100%;
    .box-card{
      margin: 10px;
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
  font-family: PingFangSC-Regular;
  font-size: 12px;
  color: #666666;
  letter-spacing: 0.19px;
}
.small-font-value{
  font-family: PingFangSC-Medium;
  font-size: 12px;
  color: #333333;
  letter-spacing: 0.19px;
  margin-left: 10px;
}
</style>
