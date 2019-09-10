<template>
  <div class="resEdit">
    <el-dialog append-to-body :modal=false width="65%" size="small" :title="optionList[optionType] + 'BOM'" :visible.sync="dialogState.show" :close-on-click-modal="false">
      <el-form class="form" :rules="rules" ref="rulesForm" :model="formData" label-width="120px">
        <el-col :span="12">
          <el-form-item prop="ZDDMC" label="零件名称">
            <el-input v-model="formData.ZDDMC" placeholder="零件名称"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="SSDD" label="所属订单">
            <el-select filterable v-model="formData.SSDD" placeholder="所属订单">
              <el-option v-for="(item,key) in dropDownListData['ssdd']" :key="key" :label="item.NAME" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="JGSL" label="加工数量">
            <el-input-number :controls=false v-model="formData.JGSL" :min="1" label="加工数量"></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="ZDDCZ" label="材质">
            <el-select @change="changeCZ" filterable v-model="formData.ZDDCZ" placeholder="材质">
              <el-option v-for="(item,key) in dropDownListData['clmc']" :key="key" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="CLXZ" @change="changeRaido" label="材料形状">
            <el-radio-group v-model="formData.CLXZ">
              <el-radio :label="1">长方体</el-radio>
              <el-radio :label="2">圆柱体</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="CLTJ" label="材料体积">
            <el-input style="width: 88%;" readonly placeholder="材料体积" v-model="formData.CLTJ"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item prop="CLDX" label="材料大小">
            <template>
              <el-col v-if="formData.CLXZ == 1" :span="8">
                <span>长(mm)</span>
                <el-input-number @blur="calculateVolume" size="mini" :controls=false v-model="volume.l" :min="0"></el-input-number>
              </el-col>
              <el-col v-if="formData.CLXZ == 1" :span="8">
                <span>宽(mm)</span>
                <el-input-number @blur="calculateVolume" size="mini" :controls=false v-model="volume.w" :min="0"></el-input-number>
              </el-col>
              <el-col v-if="formData.CLXZ == 2" :span="12">
                <span>直径(mm)</span>
                <el-input-number @blur="calculateVolume" size="mini" :controls=false v-model="volume.d" :min="0"></el-input-number>
              </el-col>
              <el-col :span="8">
                <span>高(mm)</span>
                <el-input-number @blur="calculateVolume" size="mini" :controls=false v-model="volume.h" :min="0" label="加工数量"></el-input-number>
              </el-col>
            </template>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="BLJS" label="备料件数">
            <el-input v-model="formData.BLJS" placeholder="备料件数"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="CLJE" label="材料金额">
            <el-input readonly v-model="formData.CLJE" placeholder="材料金额"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="STARTTIME" label="开始时间">
            <el-date-picker value-format="yyyy-MM-dd" v-model="formData.STARTTIME" type="date" placeholder="开始时间">
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="ENDTIME" label="结束时间">
            <el-date-picker value-format="yyyy-MM-dd" v-model="formData.ENDTIME" type="date" placeholder="结束时间">
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item prop="BMCL" label="表面处理">
            <el-input v-model="formData.BMCL" placeholder="表面处理"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="DDTZ" label="选择图纸">
            <!-- <el-input v-model="formData.DDTZ" placeholder="选择图纸"></el-input> -->
            <!-- <el-radio-group v-model="formData.DDTZ">
              <el-radio v-for="(item,i) in dropDownListData['tz']" :key="i" :label="item.id">{{item.tzmc}}</el-radio>
            </el-radio-group> -->
            <el-select v-model="formData.DDTZ" placeholder="请选择">
              <el-option v-for="(item,i) in dropDownListData['tz']" :key="i" :label="item.tzmc" :value="item.id">
                <span style="float: left">{{ item.tzmc }}</span>
                <span @click="showImage(item)" style="float: right; color: #8492a6; font-size: 13px">
                  <i class="el-icon-zoom-in"></i>
                </span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="24">
          <el-form-item prop="BZJ" label="选择组件">
            <div v-for="(item,i) in selBzjList" :key="i">
              <el-select @change="changeZj(dropDownListData['zj'][i], i)" filterable v-model="item.zjid" placeholder="组件">
                <el-option v-for="(item,key) in dropDownListData['zj']" :key="key" :label="item.zjmc" :value="item.zjid">
                  <span style="float: left">{{ item.zjmc }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">({{item.zjdj}})</span>
                </el-option>
              </el-select>
              数量：
              <el-input-number :controls=false v-model="item.zjsl" :min="1" label="组件数量"></el-input-number>
              <i class="el-icon-circle-plus" @click="addZj"></i>
              <i v-show="i !=0" class="el-icon-remove" @click="delZj(i)"></i>
            </div>
          </el-form-item>
        </el-col> -->
      </el-form>
      <el-col :span='24' :offset="9" class="footer">
        <el-button type="primary" @click="onSave">保存</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-col>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'resEdit',
  props: ['dialogState'],
  data() {
    return {
      optionList: {
        add: '新增',
        edit: '编辑',
        copy: '复制'
      },
      columnData: [],
      formData: {},
      dropDownListData: {},
      primaryKey: {},
      bzjList: [],
      selBzjList: [
        {
          id: this.$util.getUUId(),
          bomid: this.dialogState.id,
          zjid: '',
          zjmc: '',
          zjsl: 0
        }
      ],
      rules: {
        ZDDMC: [{ required: true, message: '请输入BOM名称', trigger: 'blur' }],
        SSDD: [{ required: true, message: '请选择订单', trigger: 'blur' }],
        JGSL: [{ required: true, message: '请输入加工数量', trigger: 'blur' }],
        ZDDCZ: [{ required: true, message: '请选择材质', trigger: 'blur' }]
      },
      volume: {
        l: 0,
        h: 0,
        w: 0,
        d: 0,
        cldj: 0,
        mi: 0
      }
    }
  },
  computed: {
    optionType() {
      return this.dialogState.type
    },
    tableId() {
      return this.dialogState.tableId
    },
    resId() {
      return this.dialogState.id
    }
  },
  mounted() {
    this.getSjzdData(
      'ssdd',
      'SELECT id,xmname NAME FROM scglxt_t_dd where ckzt is null'
    )
    this.getSjzdData('clmc', 'SELECT id,clmc name,cldj,mi FROM scglxt_t_cl')
    this.getSjzdData('zj', 'SELECT id zjid,zjmc,zjdj FROM scglxt_t_zj')
    this.getSjzdData(
      'tz',
      "SELECT url id,tzmc FROM scglxt_t_dd_tz where ssdd = '" +
        this.formData.SSDD +
        "'"
    )
  },
  methods: {
    showImage(file) {
      window.open(file.id, '_blank'); 
    },
    onSave() {
      let params = {}
      this.calculateVolume() //再次计算一次体积确定不会出错
      let data = this.$refs['rulesForm'].model
      params.form = {}
      Object.keys(data).map(item => {
        params.form[item.toLowerCase()] = data[item]
      })
      // this.selBzjList.map(item => {
      //   item.bomid = params.form.id
      // })
      // params.zj = this.selBzjList.filter(el => {
      //   return el.zjid != ''
      // })
      this.$refs['rulesForm'].validate(valid => {
        if (valid) {
          if (this.optionType == 'edit') {
            params.primaryKey = this.primaryKey
            this.$ajax.post(this.$api.editBomData, params).then(res => {
              if (res && res.data && res.data == 1) {
                this.$message.editSuccess()
                this.dialogState.show = false
                this.$parent.$refs.resList.getResList()
              } else {
                this.$message.editError(res.errmsg)
              }
            })
          } else if (this.optionType == 'copy') {
            params.primaryKey = this.primaryKey
            params.form.id = this.$util.getUUId()
            this.$ajax.post(this.$api.copyBomData, params).then(res => {
              if (res && res.errno == 0) {
                this.$message.success()
                this.dialogState.show = false
                this.$parent.$refs.resList.getResList()
              } else {
                this.$message.editError(res.errmsg)
              }
            })
          } else {
            this.$ajax.post(this.$api.addBomData, params).then(res => {
              if (res.errno == 0) {
                this.$message.addSuccess()
                this.dialogState.show = false
                this.$parent.$refs.resList.getResList()
              } else {
                this.$message.addError(res.errmsg)
              }
            })
          }
        }
      })
    },
    onCancel() {
      this.dialogState.show = false
    },
    //选择组件时
    changeZj(info, i) {
      let obj = this.selBzjList[i]
      this.selBzjList[i] = { ...obj, ...info }
    },
    // 切换长方体圆柱体
    changeRaido() {
      this.calculateVolume()
    },
    // 选择材质时，保存材料单价
    changeCZ(key) {
      let arr = this.dropDownListData.clmc.filter(item => {
        return item.id == key
      })
      if (arr.length == 1) {
        this.volume.cldj = arr[0].cldj || 0
        this.volume.mi = arr[0].mi || 0
      }
      this.calculateVolume()
    },
    //计算材料体积
    calculateVolume() {
      let radio = this.formData.CLXZ
      let { l, h, w, d, cldj, mi } = this.volume

      if (radio == 1) {
        this.$set(this.formData, 'CLTJ', l * w * h / 1000)
        this.formData.CLDX = l + '*' + w + '*' + h
      } else {
        this.$set(
          this.formData,
          'CLTJ',
          3.1415926 * (d / 2 * (d / 2)) * h / 1000
        )
        this.formData.CLDX = 'φ' + d + '*' + h
      }
      this.formData.CLZL = this.formData.CLTJ * mi
      this.formData.CLJE = this.formData.CLTJ * mi * cldj
    },
    // 获取表单数据，如果是编辑进行数据回填
    getFormData() {
      this.primaryKey.id = this.resId
      this.$ajax
        .get(this.$api.queryDataById, {
          tableId: this.tableId,
          id: this.resId
        })
        .then(res => {
          if (res.errno == 0) {
            this.formData = res.data
            this.formData.CLXZ = parseInt(res.data.CLXZ)
            // 如果是长方体
            if (this.formData.CLXZ == 1) {
              let dx = this.formData.CLDX.split('*')
              this.volume.l = dx[0]
              this.volume.w = dx[1]
              this.volume.h = dx[2]
            } else{
              let dx = this.formData.CLDX.split('*')
              this.volume.d = dx[0].slice(1,dx[0].length)
              this.volume.h = dx[1]
            }
          }
        })
      this.$ajax
        .get(this.$api.getZjByBomId, {
          bomid: this.resId
        })
        .then(res => {
          if (res.errno == 0) {
            if (res.data.length > 0) {
              this.selBzjList = res.data
            } else {
              this.selBzjList = [
                {
                  id: this.$util.getUUId()
                }
              ]
            }
          }
        })
    },
    // 获取数据字典数据
    getSjzdData(attr, sql) {
      this.$ajax
        .get(this.$api.getDropDownListData, {
          typesql: sql
        })
        .then(res => {
          this.$set(this.dropDownListData, attr, res.data)
        })
    },
    addZj() {
      this.selBzjList.push({
        id: this.$util.getUUId(),
        bomid: this.dialogState.id,
        zjid: '',
        zjmc: '',
        zjsl: 0
      })
    },
    delZj(i) {
      this.selBzjList.splice(i, 1)
    }
  },
  watch: {
    dialogState: {
      deep: true,
      handler() {
        if (this.dialogState.show) {
          if (this.optionType == 'edit' || this.optionType == 'copy') {
            this.getFormData()
          } else {
            let obj = {
              ID: this.$util.getUUId(),
              CLXZ: 1,
              SSDD: this.$route.query.SSDD || '',
              ZDDZT: '0501',
              ZDDMC: '',
              ZDDCZ: '',
              CLZL: 0,
              CLTJ: 0,
              CLJE: 0,
              CLDX: '',
              BMCL: '',
              DDTZ: ''
            }
            this.volume = {
              l: 0,
              h: 0,
              w: 0,
              d: 0,
              cldj: 0,
              mi: 0
            }
            this.selBzjList = [
              {
                id: this.$util.getUUId()
              }
            ]
            this.formData = obj
          }
        }
      }
    },
    'formData.SSDD'() {
      this.getSjzdData(
        'tz',
        "SELECT url id,tzmc FROM scglxt_t_dd_tz where ssdd = '" +
          this.formData.SSDD +
          "'"
      )
    }
  }
}
</script>
<style lang="scss">
.el-dialog {
  background: #f6f6f6;
  padding-bottom: 20px;
}
</style>
<style lang="scss" scoped>
.form {
  height: 100%;
  display: inline-block;
  &:after {
    content: '.';
    display: block;
    height: 0;
    clear: both;
    visibility: hidden;
  }
  .item {
    width: 45%;
    margin-top: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    .title {
      text-align: right;
      padding-right: 30px;
    }
  }
  .footer {
    margin-top: 20px;
    margin-bottom: 20px;
  }
}
</style>
