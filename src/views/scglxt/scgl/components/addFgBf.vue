<template>
  <div class="selectPerson">
    <el-dialog v-if="dialogState.show" title="手工报废单" :visible.sync="dialogState.show" width="60%">
      <el-row>
        <el-col :span="24" class="toolbar">
          <el-form :inline="true" @submit.native.prevent>
            <el-form-item label="选择订单">
              <el-select v-model="query.SSDD" @change="ssddChange" filterable placeholder="请选择">
                <el-option
                  v-for="item in selectInfo.ssdd"
                  :key="item.ID"
                  :label="item.XMNAME"
                  :value="item.ID"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="选择零件">
              <el-select v-model="query.BOMID" @change="ssljChage" filterable placeholder="请选择">
                <el-option
                  v-for="item in selectInfo.ssbom"
                  :key="item.id"
                  :label="item.zddmc"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="24">
          <span style="margin-right:20px;">勾选以下已加工记录进行报废</span>
          <el-button @click="onManualScrap" size="mini" type="warning" icon="el-icon-s-release">报废</el-button>
        </el-col>
        <el-col :span="24">
          <ResList
            ref="jgglList"
            @selectChange="selectChange"
            tableId="0109"
            :query="query"
            noAdd
            noEdit
            noTool
          >
            <el-table-column fixed="left" label="操作" width="100" align="center">
              <template slot-scope="scope">
                <el-button-group>
                  <el-button
                    type="primary"
                    @click="updateJGJL(scope.row)"
                    class="radio"
                    :label="1"
                  >修正</el-button>
                  <el-button
                    type="primary"
                    @click="deleteJGJL(scope.row)"
                    class="radio"
                    :label="1"
                  >删除</el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </ResList>
        </el-col>
      </el-row>
    </el-dialog>
    <el-dialog title="确认报废该工艺" width="30%" :visible.sync="isSureScrap">
      <div class="form">
        <el-form :model="params" ref="dhForm">
          <el-form-item prop="dhjs" label="报废件数">
            <el-input-number v-model="params.dhjs" :min="1" label="报废件数"></el-input-number>
            <br />
          </el-form-item>
          <el-form-item prop="dhyy" label="报废原因">
            <el-input v-model="params.dhyy" />
          </el-form-item>
          <el-form-item>
            <el-button @click="sureManualScrap(false)" class="namesBtn" type="primary">确定报废</el-button>
            <el-button @click="sureManualScrap(true)" class="namesBtn" type="success">确定报废，并生成新的加工单</el-button>
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
  data() {
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
  mounted() {
    this.initData();
  },
  methods: {
    initData() {
      this.$ajax
        .post(this.$api.getDdListByWhere, {
          pageSize: 1000,
          pageNumber: 1,
          where: "ckzt is null"
        })
        .then(res => {
          if (res.errno == 0) {
            this.selectInfo.ssdd = res.data.data;
          }
        });
    },
    ssddChange() {
      this.$ajax
        .get(this.$api.getDdBOMData, {
          id: this.query.SSDD
        })
        .then(res => {
          if (res.errno == 0) {
            this.selectInfo.ssbom = res.data.bomInfo;
            this.query.BOMID = "";
          }
        });
    },
    ssljChage() {
      this.$refs.jgglList.getConfig();
      this.$refs.jgglList.getResList();
    },
    selectChange(rows) {
      this.selectRows = rows;
    },
    //手工报废
    onManualScrap() {
      this.isSureScrap = true;
    },
    sureManualScrap(isAdd) {
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
    }
  },
  watch: {
    "dialogState.show"() {
      if (this.dialogState.show) {
        this.initData();
      } else {
        this.query.SSDD = "";
        this.query.BOMID = "";
      }
    }
  }
};
</script>

<style lang="scss" >
</style>
