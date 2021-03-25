<template>
  <div>
    <el-dialog v-if="dialogState.show" title="零件加工记录" :visible.sync="dialogState.show" width="80%">
      <ResList ref="bjdList" tableId="0109" :query="dialogState.query" noAdd noEdit>
        <el-table-column v-if="roles[0]=='759007553955134000000'" slot="operate" fixed="left" label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button-group>
              <el-button type="primary" @click="updateJGJL(scope.row)" class="radio" :label="1">修正</el-button>
              <el-button type="primary" @click="deleteJGJL(scope.row)" class="radio" :label="1">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </ResList>
    </el-dialog>
    <el-dialog title="修正数据" :visible.sync="isUpdate" width="30%">
      <el-form :model="formData"  ref="dhForm">
        <el-form-item prop="ddmc" label="订单名称">
          {{activeRow.DDMC}}
        </el-form-item>
        <el-form-item prop="ljmc" label="零件名称">
          {{activeRow.BOMMC}}
        </el-form-item>
         <el-form-item prop="gymc" label="工艺名称">
          {{activeRow.GYNR}}
        </el-form-item>
        <el-form-item label="切换班组人员">
           <el-select @change="changeBz" style="width:200px"
                 v-model="activeBz"
                 placeholder="请选择">
        <el-option v-for="item in bzList"
                   :key="item.id"
                   :label="item.bzmc"
                   :value="item.id">
        </el-option>
      </el-select>
        </el-form-item>
        <el-form-item prop="jgryid" label="加工人员">
          <el-radio-group v-model="radioValue">
          <el-radio
            class="namesBtn"
            type="primary"
            v-for="(item,i) in peopleList"
            :key="i"
            :label="item.id"
          >{{item.rymc}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="jgjs" label="加工件数">
          <el-input-number v-model="formData.jgjs" :min="1" label="加工件数"></el-input-number>
        </el-form-item>
        <el-form-item>
          <el-button @click="updateSaveJGJL" class="namesBtn" type="primary">确定修改</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    dialogState: {
      type: Object
    },
    noBom: {
      type: Boolean,
      default: true
    },
    isEidt: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activeRow: {},
      query: {},
      peopleList: [],
      activeBz: '',
      bzList: [],
      formData:{},
      isUpdate: false,
      radioValue:''
    };
  },
   computed: {
    ...mapGetters(['roles'])
  },
   mounted() {
    this.initData()
  },
  methods: {
    initData() {
      this.$ajax.post(this.$api.getBzList).then(res => {
        if (res.errno == 0) {
          this.bzList = res.data
          this.activeBz = this.roles[0]
          this.changeBz(this.activeBz)
        }
      })
    },
    changeBz(val) {
      this.$ajax
        .post(this.$api.getPeopleByBz, {
          bzid: val
        })
        .then(res => {
          if (res.errno == 0) {
            this.peopleList = res.data
          }
        })
    },
    //修改加工记录
    updateJGJL(row) {
      console.log(row)
      this.activeRow = row
      this.formData.jgjs = row.JGJS
      this.radioValue = row.JGRYID
      this.isUpdate = true;
      this.$ajax
        .post(this.$api.getPeopleByBz, {
          bzid: row.SSBZ
        })
        .then(res => {
          if (res.errno == 0) {
            this.peopleList = res.data
          }
        })
    },
    updateSaveJGJL() {
      let vm = this
      vm.formData.jgryid=this.radioValue
      this.$message.confirm("是否确认修改记录？修改将影响工人工时统计",() => {
        this.$ajax
          .post(this.$api.updateJGJL, {
            id: vm.activeRow.ID,
            form:vm.formData
          })
          .then(function() {
            vm.isUpdate = false
            vm.$refs.bjdList.getResList();
            vm.$message.success("修改成功！");
          });
      });
    },
    //删除加工记录
    deleteJGJL(row) {
      const vm = this;
      this.$message.confirm("是否确定删除该加工记录？删除后无法恢复").then(() => {
        this.$ajax
          .post(this.$api.deleteJGJL, {
            id: row.ID
          })
          .then(function() {
            vm.$message.success("删除成功！");
          });
      });
    }
  },
  watch: {
    dialogState: {
      deep: true,
      handler() {
        if (this.dialogState.show) {
          this.$nextTick(() => {
            this.query = this.dialogState.query;
            this.$refs.bjdList.getConfig();
            this.$refs.bjdList.getResList();
          });
        }
      }
    }
  }
};
</script>
