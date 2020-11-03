<template>
  <div>
    <ResList tableId='010411' ref="cpbykc"
             >
      <el-table-column slot="operate"
                       fixed="left"
                       label="操作"
                       min-width="80"
                       align="center">
        <template slot-scope="scope">
          <el-button-group>
            <el-button type="primary"
                       icon="el-icon-shopping-cart-full"
                       @click="passInStore(scope.row)"
                       class="radio"
                       :label="1">成品出库</el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </ResList>
    <el-dialog title="手动备用库存出库" width="30%" :visible.sync="isShow" close-on-click-modal close-on-press-escape	>
      <el-form :model="query">
        <el-form-item label="选择订单">
          <el-select v-model="query.ssdd"
                     @change="ssddChange"
                     filterable
                     placeholder="请选择">
            <el-option v-for="item in selectInfo.ssdd"
                       :key="item.ID"
                       :label="item.XMNAME"
                       :value="item.ID"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择零件">
          <el-select v-model="query.bomid"
                     filterable
                     placeholder="请选择">
            <el-option v-for="item in selectInfo.ssbom"
                       :key="item.id"
                       :label="item.zddmc"
                       :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="出库数量">
          <el-input v-model="query.cksl" />
        </el-form-item>
        <el-form-item>
          <el-button @click="onSubmit" type="primary">出库</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      isShow: false,
      selectInfo: {
        ssdd: [],
        ssbom: []
      },
      query: {
        ssdd: "",
        bomid: "",
        cksl: 0,
        bykcid: ''
      },
    }
  },
  methods: {
    initData () {
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
    ssddChange () {
      this.$ajax
        .get(this.$api.getDdBOMData, {
          id: this.query.ssdd
        })
        .then(res => {
          if (res.errno == 0) {
            this.selectInfo.ssbom = res.data.bomInfo;
            this.query.bomid = "";
          }
        });
    },
    // 成品出库
    passInStore (row) {
      this.initData()
      this.query.bykcid = row.ID
      this.isShow = true
    },
    onSubmit () {
      this.$ajax
        .post(this.$api.setBOMBykc, {
          bomid: this.query.bomid,
          bykcid: this.query.bykcid,
          sysl: this.query.cksl
        })
        .then(res => {
          if (res.errno == 0) {
              this.$message.success("出库成功");
              this.isShow = false;
              this.$refs.cpbykc.queryResList()
          }
        });
    }
  }
}
</script>

<style>
</style>