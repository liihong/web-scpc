<template>
  <div class="resEdit">
    <el-dialog append-to-body
               width="65%"
               size="small"
               :title="optionList[optionType] + 'BOM'"
               :visible.sync="dialogState.show"
               :close-on-click-modal="false">
      <el-form class="form"
               :rules="rules"
               ref="rulesForm"
               :model="formData"
               label-width="120px">
        <el-col :span="12">
          <el-form-item prop="ZDDMC"
                        label="零件名称">
            <el-input @blur="getBYKC"
                      v-model="formData.ZDDMC"
                      placeholder="零件名称"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="SSDD"
                        label="所属订单">
            <el-select filterable
                       v-model="formData.SSDD"
                       placeholder="所属订单">
              <el-option v-for="(item,key) in dropDownListData['ssdd']"
                         :key="key"
                         :label="item.NAME"
                         :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="JGSL"
                        label="加工数量">
            <el-input-number v-if="formData.ZDDZT =='0501' || optionType!= 'edit'"
                             :controls="false"
                             v-model="formData.JGSL"
                             :min="1"
                             label="加工数量"></el-input-number>
            <span v-else>{{formData.JGSL}} (订单已开始加工，不能修改加工数量)</span>
            <span style="color:red;"
                  v-if="dialogByk.sysl!=0&&dialogByk.isAdd">已使用备用库存 {{dialogByk.sysl}} 件</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="ZDDCZ"
                        label="材质">
            <el-select @change="changeCZ"
                       filterable
                       v-model="formData.ZDDCZ"
                       placeholder="材质">
              <el-option v-for="(item,key) in dropDownListData['clmc']"
                         :key="key"
                         :label="item.name"
                         :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="CLXZ"
                        @change="changeRaido"
                        label="材料形状">
            <el-radio-group v-model="formData.CLXZ">
              <!-- <el-radio :label="1">长方体</el-radio>
              <el-radio :label="2">圆柱体</el-radio>
              <el-radio :label="3">塑料</el-radio>
               <el-radio :label="3">塑料</el-radio> -->
               <el-radio :label="item.id" v-for="item in dropDownListData['clxz']" :key="item.id">{{item.mc}}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="CLTJ"
                        label="材料体积">
            <el-input style="width: 88%;"
                      placeholder="材料体积"
                      v-model="formData.CLTJ"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item prop="CLDX"
                        label="材料大小">
            <template>
              <el-col v-if="formData.CLXZ == 1"
                      :span="8">
                <span>长(mm)</span>
                <el-input-number @blur="calculateVolume"
                                 size="mini"
                                 :controls="false"
                                 v-model="volume.l"
                                 :min="0"></el-input-number>
              </el-col>
              <el-col v-if="formData.CLXZ == 1"
                      :span="8">
                <span>宽(mm)</span>
                <el-input-number @blur="calculateVolume"
                                 size="mini"
                                 :controls="false"
                                 v-model="volume.w"
                                 :min="0"></el-input-number>
              </el-col>
              <el-col v-if="formData.CLXZ == 2"
                      :span="12">
                <span>直径(mm)</span>
                <el-input-number @blur="calculateVolume"
                                 size="mini"
                                 :controls="false"
                                 v-model="volume.d"
                                 :min="0"></el-input-number>
              </el-col>
               <!--六方棒 （对边长*对边长)*高*密度*0.275-->
              <el-col v-if="formData.CLXZ == 4"
                      :span="8">
                <span>对边长(mm)</span>
                <el-input-number @blur="calculateVolume"
                                 size="mini"
                                 :controls="false"
                                 v-model="volume.dbc"
                                 :min="0"></el-input-number>
              </el-col>
              <!--圆管 （外径-壁厚)*壁厚*高*密度-->
              <el-col v-if="formData.CLXZ == 6 || formData.CLXZ == 5|| formData.CLXZ == 7"
                      :span="8">
                <span>外径(mm)</span>
                <el-input-number @blur="calculateVolume"
                                 size="mini"
                                 :controls="false"
                                 v-model="volume.wj"
                                 :min="0"></el-input-number>
              </el-col>
              <el-col v-if="formData.CLXZ == 6 || formData.CLXZ == 5 || formData.CLXZ == 7"
                      :span="8">
                <span>壁厚(mm)</span>
                <el-input-number @blur="calculateVolume"
                                 size="mini"
                                 :controls="false"
                                 v-model="volume.bh"
                                 :min="0"></el-input-number>
              </el-col>

              <el-col v-if="formData.CLXZ !=3"
                      :span="8">
                <span>高(mm)</span>
                <el-input-number @blur="calculateVolume"
                                 size="mini"
                                 :controls="false"
                                 v-model="volume.h"
                                 :min="0"></el-input-number>
              </el-col>

              <!--角钢  （边长+边长-壁厚)*壁厚*高*密度*1-->

             
            </template>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="BLJS"
                        label="备料件数">
            <el-input-number size="mini"
                             v-model="formData.BLJS"
                             :min="0"
                             placeholder="备料件数"></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="CLJE"
                        label="材料金额">
            <el-input v-model="formData.CLJE"
                      placeholder="材料金额"></el-input>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="8">
          <el-form-item prop="CLJE"
                        label="材料金额">
            <el-input v-model="formData.CLJE"
                      placeholder="材料金额"></el-input>
          </el-form-item>
        </el-col> -->
        <el-col :span="12">
          <el-form-item prop="STARTTIME"
                        label="开始时间">
            <el-date-picker value-format="yyyy-MM-dd"
                            v-model="formData.STARTTIME"
                            type="date"
                            placeholder="开始时间"></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="ENDTIME"
                        label="结束时间">
            <el-date-picker value-format="yyyy-MM-dd"
                            v-model="formData.ENDTIME"
                            type="date"
                            placeholder="结束时间"></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item prop="BMCL"
                        label="表面处理">
            <el-input v-model="formData.BMCL"
                      placeholder="表面处理"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="DDTZ"
                        label="选择图纸">
            <el-select v-model="formData.DDTZ"
                       placeholder="请选择">
              <el-option v-for="(item,i) in dropDownListData['tz']"
                         :key="i"
                         :label="item.tzmc"
                         :value="item.id">
                <span style="float: left">{{ item.tzmc }}</span>
                <span @click="showImage(item)"
                      style="float: right; color: #8492a6; font-size: 13px">
                  <i class="el-icon-zoom-in"></i>
                </span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-form>
      <el-col :span="24"
              :offset="9"
              class="footer">
        <el-button type="primary"
                   @click="onSave">保存</el-button>
        <el-button @click="onCancel">取消</el-button>
        <el-button  v-if="optionType === 'edit'" @click="stopProcess" type="danger">停止加工</el-button>
      </el-col>
    </el-dialog>
    <selectByk :dialogState="dialogByk"
               :data="dialogState.data" />
  </div>
</template>
<script>
import selectByk from "./selectByk";
export default {
  name: "resEdit",
  props: ["dialogState"],
  components: {
    selectByk
  },
  data() {
    return {
      //是否使用备用库存零件
      dialogByk: {
        show: false,
        data: [],
        sysl: 0,
        isAdd: false
      },
      optionList: {
        add: "新增",
        edit: "编辑",
        copy: "复制"
      },
      columnData: [],
      formData: {},
      dropDownListData: {},
      primaryKey: {},
      bzjList: [],
      rules: {
        ZDDMC: [{ required: true, message: "请输入BOM名称", trigger: "blur" }],
        SSDD: [{ required: true, message: "请选择订单", trigger: "blur" }],
        JGSL: [{ required: true, message: "请输入加工数量", trigger: "blur" }],
        ZDDCZ: [{ required: true, message: "请选择材质", trigger: "blur" }]
      },
      volume: {
        l: 0,
        h: 0,
        w: 0,
        d: 0,
        cldj: 0,
        dbc: 0,
        mi: 0,
        wj:0,
        bh:0
      }
    };
  },
  computed: {
    optionType() {
      return this.dialogState.type;
    },
    tableId() {
      return this.dialogState.tableId;
    },
    resId() {
      return this.dialogState.id;
    }
  },
  mounted() {
    this.getSjzdData(
      "ssdd",
      "SELECT id,xmname NAME FROM scglxt_t_dd where ckzt is null order by sjcjsj desc"
    );
    this.getSjzdData("clmc", "SELECT id,clmc name,cldj,mi FROM scglxt_t_cl");
    this.getSjzdData("zj", "SELECT id zjid,zjmc,zjdj FROM scglxt_t_zj");
    this.getSjzdData(
      "tz",
      "SELECT url id,tzmc FROM scglxt_t_dd_tz where ssdd = '" +
        this.formData.SSDD +
        "'"
    );
    this.getSjzdData(
      "clxz",
      "SELECT id,mc from scglxt_tyzd where xh like '03__'"
    );
    this.dialogByk.isAdd = false
    this.dialogByk.JGSL = 0
    this.dialogByk.show = false
  },
  methods: {
    getBYKC() {
      if (this.formData.ZDDMC && this.formData.ZDDMC!= '') {
        this.$ajax
          .post(this.$api.getBOMBykc, { name: this.formData.ZDDMC })
          .then(res => {
            if (res.errno == 0) {
              if (res.data.length > 0) {
                this.dialogByk.data = res.data;
                this.dialogByk.show = true;
              }
            } else {
              throw("没有检索到库存");
            }
          });
      }
    },
    showImage(file) {
      window.open(file.id, "_blank");
    },
    onSave() {
      let params = {};
      this.calculateVolume(); //再次计算一次体积确定不会出错
      let data = this.$refs["rulesForm"].model;
      params.form = {};
      Object.keys(data).map(item => {
        params.form[item.toLowerCase()] = data[item];
      });
      this.$refs["rulesForm"].validate(valid => {
        if (valid) {
          if (this.optionType == "edit") {
            params.primaryKey = this.primaryKey;
            this.$ajax.post(this.$api.editBomData, params).then(res => {
              if (res && res.data && res.data == 1) {
                this.$message.editSuccess();
                this.dialogState.show = false;
                this.$parent.$refs.resList.getResList();
              } else {
                this.$message.editError(res.errmsg);
              }
            });
          } else if (this.optionType == "copy") {
            params.primaryKey = this.primaryKey;
            params.form.id = this.$util.getUUId();
            this.$ajax.post(this.$api.copyBomData, params).then(res => {
              if (res && res.errno == 0) {
                this.$message.success();
                this.dialogState.show = false;
                this.$parent.$refs.resList.getResList();
              } else {
                this.$message.editError(res.errmsg);
              }
            });
          } else {
            this.$ajax.post(this.$api.addBomData, params).then(res => {
              if (res.errno == 0) {
                this.$message.addSuccess();
                this.dialogState.show = false;
                this.$parent.$refs.resList.getResList();
                this.$ajax
                  .post(this.$api.setBOMBykc, {
                    bomid: params.form.id,
                    bykcid: this.dialogByk.data[0].id,
                    sysl: this.dialogByk.sysl
                  })
                  .then(res => {
                    if (res.errno == 0) {
                      if (res.errno == 0) {
                        this.$message.success("关联成功");
                        this.dialogState.show = false;
                      }
                    }
                  });
              } else {
                this.$message.addError(res.errmsg);
              }
            });
          }
        }
      });
    },
    onCancel() {
      this.dialogState.show = false;
    },
    // 切换长方体圆柱体
    changeRaido() {
      this.calculateVolume();
    },
    // 选择材质时，保存材料单价
    changeCZ(key) {
      let arr = this.dropDownListData.clmc.filter(item => {
        return item.id == key;
      });
      if (arr.length == 1) {
        this.volume.cldj = arr[0].cldj || 0;
        this.volume.mi = arr[0].mi || 0;
      }
      this.calculateVolume();
    },
    //计算材料体积
    calculateVolume() {
      let radio = this.formData.CLXZ;
      let { l, h, w, d, cldj, mi, dbc, wj,bh } = this.volume;

      // 长方体
      if (radio == 1) {
        this.$set(this.formData, "CLTJ", ((l * w * h) / 1000).toFixed(2));
        this.formData.CLDX = l + "*" + w + "*" + h;
        this.formData.CLZL = this.formData.CLTJ * mi;
      } 
      // 圆柱体
      else if (radio == 2) {
        this.$set(
          this.formData,
          "CLTJ",
          ((3.1415926 * ((d / 2) * (d / 2)) * h) / 1000).toFixed(2)
        );
        this.formData.CLDX = "φ" + d + "*" + h;
        this.formData.CLZL = this.formData.CLTJ * mi;
      }

       // 六方棒
      else if (radio == 4) {
        this.$set(
          this.formData,
          "CLTJ",
          ((3.14 * ((dbc*dbc) * h) *0.275) / 1000).toFixed(2)
        );
        this.formData.CLDX = "φ" + dbc + '*' + dbc  + "*" + h+'*0.275';

        this.formData.CLZL = this.formData.CLTJ * mi;
      }

       // 角钢
      else if (radio == 5) {
        this.$set(
          this.formData,
          "CLTJ",
          (((wj+wj-bh)*bh * h) / 1000).toFixed(2)
        );
        this.formData.CLDX = '('+ wj + '+' + wj + '-' + bh  + ")*"+bh+"*" + h;
        this.formData.CLZL = this.formData.CLTJ * mi;
      }

       // 圆管
      else if (radio == 6) {
        this.$set(
          this.formData,
          "CLTJ",
          (((wj-bh)*bh * h) / 10000).toFixed(2)
        );
        this.formData.CLDX = '('+wj + '-' + bh  + ")*"+bh+"*" + h;
        this.formData.CLZL = this.formData.CLTJ * mi;
      }

       // 方管
      else if (radio == 7) {
        this.$set(
          this.formData,
          "CLTJ",
          (((wj-bh)*bh * h*4) / 1000).toFixed(2)
        );
        this.formData.CLDX = '('+wj + '-' + bh  + ")*"+bh+"*4*" + h;
        this.formData.CLZL = this.formData.CLTJ * mi;
      }
      console.log(this.formData.CLTJ, mi, cldj)
      this.formData.CLJE = (
        this.formData.BLJS *
        (this.formData.CLTJ * mi * cldj)
      ).toFixed(2);
    },
    // 获取表单数据，如果是编辑进行数据回填
    getFormData() {
      return new Promise((resolve,reject) => {
      this.primaryKey.id = this.resId;  
      this.$ajax
        .get(this.$api.queryDataById, {
          tableId: this.tableId,
          id: this.resId,
          flag: "UPDATE"
        })
        .then(res => {
          if (res.errno == 0) {
            this.formData = res.data;

            // this.formData.CLXZ = parseInt(res.data.CLXZ);
            // 如果是长方体
            if (this.formData.CLXZ == 1) {
              let dx = this.formData.CLDX.split("*");
              this.volume.l = dx[0];
              this.volume.w = dx[1];
              this.volume.h = dx[2];
            } else if(this.formData.CLXZ == 7) {
              let dx = this.formData.CLDX.split("*");
              this.volume.bh=dx[1]
              console.log(dx[0].split('-')[0])
              this.volume.wj=dx[0].split('-')[0].replace('(','')
              this.volume.h = dx[3];
            }
            else{
              let dx = this.formData.CLDX.split("*");
              this.volume.d = dx[0].slice(1, dx[0].length);
              this.volume.h = dx[1];
            }
            this.changeCZ(this.formData.ZDDCZ);
            resolve()
          }
        }).then(()=>{
           if(this.formData.CLDX === null || this.formData.CLDX === ''){
            this.getCLInfoByMC()
           }
        }).catch(()=>{
          reject()
        });
      })
      
    },
    // 查询数据库中是否有当前名称回填材料信息
    getCLInfoByMC(){
        this.$ajax.get(this.$api.getInfoByBomMc, {
              bommc: this.formData.ZDDMC,
              id: this.resId
            }).then(res=>{
              if(res.errno === 0) {
                if(res.data.length>0){
                  const infos = res.data[0]
                  // 如果是长方体
                  if (infos.clxz == 1) {
                    let dx = infos.cldx.split("*");
                    this.volume.l = dx[0];
                    this.volume.w = dx[1];
                    this.volume.h = dx[2];
                  } else {
                    let dx = infos.cldx.split("*");
                    this.volume.d = dx[0].slice(1, dx[0].length);
                    this.volume.h = dx[1];
                  }
                  this.changeCZ(infos.zddcz);
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
          this.$set(this.dropDownListData, attr, res.data);
        });
    },
    stopProcess(){
      this.$ajax
        .post(this.$api.stopBOMProcess, {
          bomid: this.resId
        })
        .then(res => {
          if(res.errno === 0)
            this.$message.success('停止加工')
            this.dialogState.show = false
        });
    }
  },
  watch: {
    dialogState: {
      deep: true,
      immediate:true,
      async handler() {
        if (this.dialogState.show) {
          if (this.optionType == "edit" || this.optionType == "copy") {
            await this.getFormData();
            if(this.optionType == 'copy') {
              this.getBYKC()
            }
          } else {
            let obj = {
              ID: this.$util.getUUId(),
              CLXZ: 1,
              SSDD: this.$route.query.SSDD || "",
              ZDDZT: "0501",
              ZDDMC: "",
              ZDDCZ: "",
              BLJS: 0,
              CLZL: 0,
              CLTJ: 0,
              CLJE: 0,
              CLDX: "",
              BMCL: "",
              DDTZ: ""
            };
            this.volume = {
              l: 0,
              h: 0,
              w: 0,
              d: 0,
              cldj: 0,
              mi: 0
            };
            this.formData = obj;
          }
        }
      }
    },
    "formData.SSDD"() {
      this.getSjzdData(
        "tz",
        "SELECT url id,tzmc FROM scglxt_t_dd_tz where ssdd = '" +
          this.formData.SSDD +
          "'"
      );
    },
    "formData.BLJS"() {
      this.calculateVolume();
    }
  }
};
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
