<template>
  <div>
    <el-dialog v-if="dialogState.show" append-to-body width="63%" size="small" title="外协单预览"
      :visible.sync="dialogState.show" :close-on-click-modal="false">
      <div class="cgjy" id="printTest">
        <div class="title">
          <h1>北京三维博艺机械制造有限公司产品外协单</h1>
          <h6 style="font-size: 14px">
            Beijing Sanwei Boyi Machinery Manufacturing Co.Ltd. WaiXiedan
          </h6>
          <div></div>
        </div>
        <div class="cgd-header">
          <div class="line">
            <div>
              外协单位：<el-select v-model="activeCj">
                <el-option v-for="item in wxCjList" :key="item.id" :label="item.cjmc" :value="item.id"></el-option>
              </el-select>
            </div>
            <div class="flex">
              <div style="width: 95px">联&nbsp;系&nbsp; 人：</div>
              {{ actionCjItem ? actionCjItem.cjmc : "" }}
            </div>
            <div class="flex">
              <div style="width: 95px">
                电 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;话：
              </div>
              {{ actionCjItem ? actionCjItem.cjlxdh : "" }}
            </div>
          </div>
          <div class="line">
            <div>申请委外时间：{{ nowDate }}</div>
            <div>要求交货时间：</div>
          </div>
        </div>
        <el-table border :data="tableData">
          <el-table-column label="序号" type="index" align="center"></el-table-column>
          <el-table-column align="center" v-for="(item, key) in columns" :key="key" :label="item.name" :prop="item.id"
            :min-width="item.length != '' ? item.length : 100">
            <template slot="WCRQ" slot-scope="scope">
              范德萨<span class="spanText" @click="gybpClick(scope.row)">
                东方闪电
              </span>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 10px; justify-content: space-between" class="flex">
          <span>地址：北京市顺义区李遂镇葛代子村</span>
          <span>电话：010-64371682 64386101 </span>
          <span>传真：010-64325726</span>
        </div>
        <div style="margin-top: 10px; justify-content: end" class="flex">
          <span>经手人：_____________________</span>
        </div>
      </div>
      <div style="text-align: center; margin: 10px">
        <!-- <el-button type="primary"
                   @click="onPass">确认外协</el-button> -->
        <el-button type="primary" v-print="'#printTest'">打印外协单</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "cgjy",
  props: ["dialogState"],
  data() {
    return {
      tableData: [],
      khInfo: {},
      wxCjList: [],
      activeCj: "",
      columns: [
        {
          id: "SSDD_TEXT",
          name: "订单号",
        },
        {
          id: "BOMID_TEXT",
          name: "零件名称",
        },
        {
          id: "JGSL",
          name: "数量",
          length: 40,
        },
        {
          id: "ZDDCZ",
          name: "材料",
          length: 50,
        },
        {
          id: "ZYSX",
          name: "加工内容",
        },
        {
          id: "WCRQ",
          name: "要求完成日期",
        },

        {
          id: "CLDX",
          name: "规格",
        },
        {
          id: "gg",
          name: "表面积或重量",
          length: 50,
        },
        {
          id: "dj",
          name: "单价",
          length: 50,
        },
      ],
    };
  },
  computed: {
    nowDate() {
      let now = new Date();
      return (
        now.getFullYear() +
        "年" +
        (now.getMonth() + 1) +
        "月" +
        now.getDate() +
        "日"
      );
    },
    actionCjItem() {
      return this.wxCjList.find((c) => {
        return c.id == this.activeCj;
      });
    },
  },
  mounted() {
    this.initData();
  },
  methods: {
    async initData() {
      const res = await this.$ajax.get(this.$api.getAllWxCj);
      this.wxCjList = res.data;
    },
    onPass() {
      const vm = this;
      this.$message.confirm("是否确认统一外协", () => {
        let arr = [];
        this.dialogState.selectRows.map((item) => {
          arr.push(item.ID);
        });
        if (arr.length > 0) {
          this.$ajax
            .post(this.$api.BOMOutHelp, {
              id: arr.join(","),
            })
            .then(function () {
              vm.$message.success("批量外协成功！");
              vm.$parent.$refs.zjryjy.getResList();
              vm.dialogState.show = false;
            });
        }
      });
    },
    onCancel() {
      this.dialogState.show = false;
    },
  },
  watch: {
    dialogState: {
      deep: true,
      handler() {
        this.tableData = this.dialogState.selectRows;
        console.log(this.tableData);
        this.initData();
      },
    },
  },
};
</script>
<style lang="scss">
.cgjy {
  background: #ffffff;
  padding: 20px;

  .title {
    font-size: 32px;
    text-align: center;
    border-bottom: 1px solid #999999;
  }

  .cgd-header {
    display: flex;
    justify-content: space-between;

    .line {
      margin: 10px;
    }
  }
}
</style>
