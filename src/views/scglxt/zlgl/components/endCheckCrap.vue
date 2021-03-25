<template>
  <div class="selectPerson">
    <el-dialog v-if="dialogState.show"
               title="手工报废单"
               :visible.sync="dialogState.show"
               width="60%">
      <el-row>
        <el-col :span="24"
                class="toolbar">
          <el-form :inline="true"
                   @submit.native.prevent>
            <el-form-item label="订单">
              {{dialogState.row.SSDD_TEXT}}
            </el-form-item>
            <el-form-item label="零件">
              {{dialogState.row.BOMID_TEXT}}
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="24">
          <span style="margin-right:20px;">勾选以下已加工记录进行报废</span>
          <el-button @click="onManualScrap"
                     size="mini"
                     type="warning"
                     icon="el-icon-s-release">报废</el-button>
          <el-button @click="onManualScrapCL"
                     size="mini"
                     type="danger"
                     icon="el-icon-s-release">材料报废</el-button>
          <el-button @click="onManualScrapJS"
                     size="mini"
                     type="danger"
                     icon="el-icon-s-release">技术报废</el-button>

        </el-col>
        <el-col :span="24">
          <ResList ref="jgglList"
                   @selectChange="selectChange"
                   tableId="0109"
                   :query="query"
                   noAdd
                   noEdit
                   noTool>
            <el-table-column fixed="left"
                             label="操作"
                             width="100"
                             align="center">
              <template slot-scope="scope">
                <el-button-group>
                  <el-button type="primary"
                             @click="updateJGJL(scope.row)"
                             class="radio"
                             :label="1">修正</el-button>
                  <el-button type="primary"
                             @click="deleteJGJL(scope.row)"
                             class="radio"
                             :label="1">删除</el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </ResList>
        </el-col>
      </el-row>
    </el-dialog>
    <el-dialog title="确认报废该工艺"
               width="30%"
               :visible.sync="isSureScrap">
      <div class="form">
        <el-form :model="params"
                 ref="dhForm">
          <el-form-item prop="dhjs"
                        label="报废件数">
            <el-input-number v-model="params.dhjs"
                             :min="1"
                             label="报废件数"></el-input-number>
            <br />
          </el-form-item>
          <el-form-item prop="dhyy"
                        label="报废原因">
            <el-input v-model="params.dhyy" />
          </el-form-item>
          <el-form-item>
            <el-button @click="sureManualScrap(false)"
                       class="namesBtn"
                       type="primary">确定报废</el-button>
            <el-button @click="sureManualScrap(true)"
                       class="namesBtn"
                       type="success">确定报废，并生成新的加工单</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  components: {},
  props: ["dialogState"],
  data () {
    return {
      query: {
        SSDD: "",
        BOMID: ""
      },
      selectInfo: {
        ssdd: [],
        ssbom: []
      },
      selectRows: [],
      isSureScrap: false,
      params: {
        dhjs: 1,
        dhyy: ""
      }
    };
  },
  methods: {
    ssljChage () {
      this.query.SSDD = this.dialogState.row.SSDD
      this.query.BOMID = this.dialogState.row.BOMID
      this.$nextTick(() => {
        this.$refs.jgglList.getConfig();
        this.$refs.jgglList.getResList();
      })
    },
    selectChange (rows) {
      this.selectRows = rows;
    },
    //手工报废
    onManualScrap () {
      if (this.selectRows.length == 0) {
        this.$message({ message: '请打钩选择报废工艺！', type: 'warning' })
        return
      }
      this.isSureScrap = true;
    },
    sureManualScrap (isAdd) {
      let params = this.params;
      if (isAdd) {
        params.isAdd = 1;
      }

      params.jggl = this.selectRows[0];
      params.bomid = this.query.BOMID
      this.$ajax.post(this.$api.sureManualScrap, params).then(res => {
        if (res.errno == 0) {
          this.selectInfo.ssbom = res.data.bomInfo;
          this.query.BOMID = "";
          this.isSureScrap = false;
          this.dialogState.show = false
          this.$message.success(`成功报废零件!`);
          this.$parent.$refs.bflist.getResList();
        }
      });
    },
    // 材料报废，删除所有加工记录，生成新订单
    onManualScrapCL () {
      if (this.selectInfo.ssbom == '') {
        this.$message.warning(`请选择报废BOM!`);
        return
      }
      this.$message.confirm('材料报废默认全部报废并生成新的加工单？', () => {
        this.$ajax.post(this.$api.sureManualScrapCL, {
          ssdd: this.query.SSDD,
          bomid: this.query.BOMID
        }).then(res => {
          if (res.errno == 0) {
            this.$message.success(`成功报废零件并生成新的加工单!`);
            this.isSureScrap = false;
            this.dialogState.show = false
          }
        });
      });
    },
    // 技术报废 保留现有工时，生成新订单，
    onManualScrapJS () {
    if (this.selectInfo.ssbom == '') {
        this.$message.warning(`请选择报废BOM!`);
        return
      }
      this.$message.confirm('技术报废默认保留现有工时并生成新的加工单？', () => {
        this.$ajax.post(this.$api.sureManualScrapJS, {
          ssdd: this.query.SSDD,
          bomid: this.query.BOMID
        }).then(res => {
          if (res.errno == 0) {
            this.$message.success(`成功报废零件并生成新的加工单!`);
            this.isSureScrap = false;
            this.dialogState.show = false
          }
        });
      });
    }
  },
  watch: {
    "dialogState.show" () {
      if (this.dialogState.show) {
        this.ssljChage();
      }
    }
  }
};
</script>

<style lang="scss" >
</style>
