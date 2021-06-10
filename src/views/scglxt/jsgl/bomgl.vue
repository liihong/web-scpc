<template>
  <div class="ddgl">
    <ResList tableId="0104"
             :query="query"
             noEdit
             ref="resList"
             @selectChange="getChecks">
      <!-- <span slot="query"
            class="autoDD">
             <el-form-item label="订单号">
          <el-input size="small"
                    v-model="query.SSDD"
                    placeholder="订单号"></el-input>
        </el-form-item>
        
      </span> -->
      <span slot="toolBar"
            class="autoDD">
       <el-button icon="el-icon-box"
                   type="success"
                   @click="beginBl">发往备料</el-button>
        <el-button type="warning"
                   @click="htBjd">报价单</el-button>
      </span>
      <el-table-column slot="operate"
                       fixed="left"
                       label="操作"
                       width="250"
                       align="center">
        <template slot-scope="scope">
          <el-button-group size="mini">
            <el-button size="mini"
                       type="primary"
                       @click="setJGgy(scope.row)">工艺</el-button>
            <el-button size="mini"
                       type="primary"
                       @click="copyBomRow(scope.row)">复制</el-button>
            <el-button size="mini"
                       type="primary"
                       @click="editBomRow(scope.row)">编辑</el-button>
            <el-button size="mini"
                       type="danger"
                       @click="handleDelete(scope.row)">删除</el-button>
          </el-button-group>
        </template>
      </el-table-column>
      <template slot="SSDD"
                slot-scope="scope">
        <router-link style="color:#48b884;"
                     :to="{path: 'ddgl', query: {ID: scope.row.SSDD}}"><span>{{scope.row.SSDD_TEXT}}</span></router-link>
      </template>
      <template slot="CLZT"
                slot-scope="scope">
        <span>{{scope.row.CLZT == '1' ? '已备料' : scope.row.CLZT == '2'?'自备料':'未备料'}}</span>
      </template>
      <template slot="ZDDJB"
                slot-scope="scope">
        <el-tag v-show="scope.row.ZDDJB"
                effect="dark"
                :type="scope.row.ZDDJB == '0402' ? 'warning' : scope.row.ZDDJB == '0403' ? '' : 'danger'">{{scope.row.ZDDJB_TEXT}}</el-tag>
      </template>
      <template slot="DQJQ"
                slot-scope="scope">
        <div @click="openJgjl(scope.row.ID)"
             style="text-align:left;"
             v-html="scope.row.DQJQ"></div>
      </template>
    </ResList>
    <gygxDialog  v-if="dialogState.show" :dialogState="dialogState"
                ref="gygx" />
    <editBom :dialogState="bomForm" />
    <bjdList noBom
             :dialogState="bjdState" />
    <jgjlDialog :dialogState="dialogJgjl" />
  </div>
</template>

<script>
import gygxDialog from "./components/gygx";
import editBom from "./components/editBom";
import bjdList from "../xsgl/components/bjdList";
import jgjlDialog from "../zlgl/components/jgjlDialog";
export default {
  name: "bomgl",
  components: {
    gygxDialog,
    editBom,
    bjdList,
    jgjlDialog
  },
  data () {
    return {
      dialogJgjl: {
        show: false,
        query: {}
      },
      dialogState: {
        row: {},
        show: false,
        type: "edit"
      },
      bomForm: {
        show: false,
        type: "add",
        tableId: "0104",
        id: "",
        formData: {
          ID: this.$util.getUUId(),
          CLXZ: 1,
          SSDD: this.$route.query.SSDD || "",
          ZDDZT: "0501"
        }
      },
      bjdState: {
        show: false,
        query: {}
      },
      selectRows: [],
      query: {}
    };
  },
  computed: {
    ssdd () {
      if (this.$route.query.SSDD) {
        return this.$route.query.SSDD
      } else {
        return '';
      }
    }
  },
  mounted () {
     this.$set(this.query,'SSDD',this.$route.query.SSDD);
  },
  methods: {
    openJgjl (bomid) {
      this.dialogJgjl.query = { BOMID: bomid }
      this.dialogJgjl.show = true
    },
    //报价单
    htBjd () {
      this.$ajax
        .get(this.$api.queryDataById, {
          tableId: "0102",
          id: this.$route.query.SSDD
        })
        .then(res => {
          this.bjdState.query = {
            SSHT: res.data.SSHT,
            SSDD: this.$route.query.SSDD
          };
          this.bjdState.show = true;
        });
    },
    // 设置工艺工序
    setJGgy (row) {
      this.dialogState.show = true;
      this.dialogState.row = row;
    },
    getChecks (sel) {
      this.selectRows = sel;
    },
    //标记备料状态开始备料，将所有多选的Id的clzt=0
    beginBl () {
      this.$message.confirm("是否发送该订单零件到仓库备料?", () => {
        this.$ajax
          .post(this.$api.updateAllDdBLZT, { ssdd: this.ssdd })
          .then(res => {
            if (res.errno == 0) {
              this.$message.success("已发送仓库开始备料");
            }
          });
      });
    },
    //新增事件处理
    handleAdd () {
      this.bomForm.type = "add";
      this.bomForm.id = this.$util.getUUId();
      this.bomForm.show = true;
    },
    handleDelete (row) {
      this.$message.confirm("删除BOM并删除该BOM下所有工艺?", () => {
        this.$ajax
          .post(this.$api.deleteBOM, {
            id: row["ID"]
          })
          .then(res => {
            if (res && res.data == 1) {
              this.$message.deleteSuccess("删除BOM信息成功！");
              this.$refs.resList.getResList();
            } else {
              this.$message.deleteError(res.data.errmsg);
            }
          });
      });
    },
    // 编辑
    editBomRow (row) {
      this.bomForm.type = "edit";
      this.bomForm.id = row.ID;
      this.bomForm.formData = row;
      this.bomForm.show = true;
    },
    copyBomRow (row) {
      this.bomForm.type = "copy";
      this.bomForm.id = row.ID;
      this.bomForm.formData = row;
      this.bomForm.show = true;
    }
  },
  watch:{
    '$route.query'(to){
      this.$set(this.query,'SSDD',to.SSDD);
    }
  }
};
</script>
<style lang="scss" scoped>
.ddgl {
  .autoDD {
    margin: 0 10px;
  }
}
</style>

