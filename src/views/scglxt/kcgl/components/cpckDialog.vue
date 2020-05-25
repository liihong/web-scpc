<template>
  <div>
    <el-dialog
      v-if="dialogState.show"
      append-to-body
      width="50%"
      size="small"
      title="出库单预览"
      :visible.sync="dialogState.show"
      :close-on-click-modal="false"
    >
      <div class="cgjy" id="printTest">
        <div class="title">
          <h1>北京三维博艺机械制造有限公司出库单</h1>
          <h6 style="font-size:14px">Beijing Sanwei Boyi Machinery Manufacturing Co.Ltd. Chukudan</h6>
          <div></div>
        </div>
        <div class="cgd-header">
          <div class="line">
            <div>TO:{{khInfo.mc}}</div>
            <div>TEL:{{khInfo.lxdh}}</div>
            <div>FAX:{{khInfo.fax}}</div>
            <div>Date:{{nowDate}}</div>
          </div>
          <div class="line">
            <div>FROM:北京三维博艺机械制造有限公司</div>
            <div>ADD:北京市顺义区李遂镇葛代子村委会斜对面</div>
            <div>TEL:010-64386101</div>
            <div>FAX:010-64325726</div>
          </div>
        </div>
        <el-table border :data="tableData">
          <el-table-column type="index" align="center"></el-table-column>
          <el-table-column
            align="center"
            v-for="(item,key) in columns"
            :key="key"
            :label="item.name"
            :prop="item.id"
            :min-width="(item.length != '')?item.length:100"
          ></el-table-column>
        </el-table>
        <div>以上货品已经收妥，核对无误，如有异议，七天内提出。否则不得退货。</div>
        <div>
          <span>收货单位：_________________________</span>
          <span>付款方式：_________________ 日期：____________年_____月_____日</span>
        </div>
      </div>
      <div style="text-align:center;margin:10px;">
        <el-button type="primary" @click="onPass">确认出库</el-button>
        <el-button type="primary" v-print="'#printTest'">打印出库单</el-button>
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
      khInfo:{},
      columns: [
        {
          id: "ZDDMC",
          name: "品名",
          length: 150
        },
        {
          id: "clxd",
          name: "规格"
        },
        {
          id: "dw",
          name: "单位",
          length: 50
        },
        {
          id: "JGSL",
          name: "数量",
          length: 50
        },
        {
          id: "dj",
          name: "单价"
        },
        {
          id: "je",
          name: "金额"
        },
        {
          id: "remark",
          name: "备注"
        }
      ]
    };
  },
  computed: {
    nowDate() {
      let now = new Date();
      return (
        now.getFullYear() + "年" + (now.getMonth()+1) + "月" + now.getDate() + "日"
      );
    }
  },
  mounted() {},
  methods: {
    initData() {
      let dd = this.dialogState.selectRows[0].SSDD;
      this.$ajax
        .get(this.$api.getDDKhxxById, {
          ssdd: dd
        })
        .then(res=>{
          if(res.errno == 0){
            this.khInfo = res.data
          }
        });
    },
    onPass() {
      const vm = this
      this.$message.confirm("是否确认出库信息", () => {
        let arr = [];
        this.dialogState.selectRows.map(item => {
          arr.push(item.ID);
        });
        if (arr.length > 0) {
          this.$ajax
            .post(this.$api.BOMOutStore, {
              id: arr.join(",")
            })
            .then(function() {
              vm.$message.success("批量出库成功！");
              vm.$parent.$refs.zjryjy.getResList();
              vm.dialogState.show = false
            });
        }
      });
    },
    onCancel() {
      this.dialogState.show = false;
    }
  },
  watch: {
    dialogState: {
      deep: true,
      handler() {
        this.tableData = this.dialogState.selectRows;
        this.initData();
      }
    }
  }
};
</script>
<style lang="scss" >
.cgjy {
  background: #ffffff;
  padding:20px;
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
