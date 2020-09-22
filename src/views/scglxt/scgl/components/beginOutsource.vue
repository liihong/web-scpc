<template>
  <div>
    <el-dialog v-if="dialogState.show"
               append-to-body
               width="63%"
               size="small"
               title="外协单预览"
               :visible.sync="dialogState.show"
               :close-on-click-modal="false">
      <div class="cgjy"
           id="printTest">
        <div class="title">
          <h1>北京三维博艺机械制造有限公司产品外协单</h1>
          <h6 style="font-size:14px">Beijing Sanwei Boyi Machinery Manufacturing Co.Ltd. WaiXiedan</h6>
          <div></div>
        </div>
        <div class="cgd-header">
          <div class="line">
            <div>BOM号:{{khInfo.mc}}</div>
            <div>项目联系人:{{khInfo.lxdh}}</div>
            <div>电话:{{khInfo.fax}}</div>
            <div>申请委外时间:{{nowDate}}</div>
          </div>
          <div class="line">
            <div>要求交货时间：</div>
            <div>外协单位:
              <el-select v-model="activeCj">
                <el-option v-for="item in wxCjList"
                           :key="item.id"
                           :label="item.cjmc"
                           :value="item.id"></el-option>
              </el-select>
            </div>
            <div>地址:</div>
            <div>联系人:</div>
            <div>联系电话:</div>
          </div>
        </div>
        <el-table border
                  :data="tableData">
          <el-table-column label="序号"
                           type="index"
                           align="center"></el-table-column>
          <el-table-column align="center"
                           v-for="(item,key) in columns"
                           :key="key"
                           :label="item.name"
                           :prop="item.id"
                           :min-width="(item.length != '')?item.length:100"></el-table-column>
        </el-table>
        <div style="margin-top:10px;">
          <span>库房签字：_____________</span>
          <span>车间主管审核：_______________ 领料人：_________领料日期：_____年_____月_____日</span>
        </div>
      </div>
      <div style="text-align:center;margin:10px;">
        <el-button type="primary"
                   @click="onPass">确认出库</el-button>
        <el-button type="primary"
                   v-print="'#printTest'">打印出库单</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "cgjy",
  props: ["dialogState"],
  data () {
    return {
      tableData: [],
      khInfo: {},
      wxCjList: [],
      activeCj: '',
      columns: [
        {
          id: "BOMID_TEXT",
          name: "名称",
          length: 150
        },
        {
          id: "dw",
          name: "材质",
          length: 50
        },
        {
          id: "JGSL",
          name: "单位",
          length: 50
        },
        {
          id: "dj",
          name: "数量"
        },
        {
          id: "je",
          name: "材料规格"
        },
        {
          id: "remark",
          name: "材料件数"
        },
        {
          id: "remark",
          name: "单价"
        },
        {
          id: "remark",
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
    nowDate () {
      let now = new Date();
      return (
        now.getFullYear() + "年" + (now.getMonth() + 1) + "月" + now.getDate() + "日"
      );
    }
  },
  mounted () {
    this.initData()
  },
  methods: {
    async initData () {
      const res = await this.$ajax.get(this.$api.getAllWxCj)
      this.wxCjList = res.data
    },
    onPass () {
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
            .then(function () {
              vm.$message.success("批量出库成功！");
              vm.$parent.$refs.zjryjy.getResList();
              vm.dialogState.show = false
            });
        }
      });
    },
    onCancel () {
      this.dialogState.show = false;
    }
  },
  watch: {
    dialogState: {
      deep: true,
      handler () {
        this.tableData = this.dialogState.selectRows;
        console.log(this.tableData)
        this.initData();
      }
    }
  }
};
</script>
<style lang="scss" >
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
