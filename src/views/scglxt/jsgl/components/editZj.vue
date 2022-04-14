<template>
  <div class="resEdit">
    <el-dialog append-to-body :modal=false width="50%" size="small" :title="optionType == 'add' ? '新增组件' : optionType == 'copy'? '复制组件' :'编辑组件'" :visible.sync="dialogState.show" :close-on-click-modal="false">
      <el-form class="form" :rules="rules" ref="rulesForm" :model="formData" label-width="120px">
        <el-col :span="12">
          <el-form-item prop="ssdd" label="所属订单">
            <el-select @change="changeSSDD" filterable v-model="formData.ssdd" placeholder="所属订单">
              <el-option v-for="(item,key) in dropDownListData['ssdd']" :key="key" :label="item.NAME" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="zjmc" label="组件名称">
            <el-input v-model="formData.zjmc" placeholder="组件名称"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="zjkc" label="组件数量">
            <el-input-number width="100%" :controls=false v-model="formData.zjkc" :min="1" label="加工数量"></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="zjdj" label="组件单价">
            <el-input-number width="100%" :controls=false v-model="formData.zjdj" :min="1" label="组件单价"></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="zjsm" label="组件说明">
            <el-input v-model="formData.zjsm" placeholder="组件说明"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="bz" label="备注">
            <el-input v-model="formData.bz" placeholder="备注"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item prop="bzj" label="选择标准件">
            <div v-for="(el,i) in selBzjList" :key="i">
              <el-select  style="width:170px;" @change="((val)=>{changeCZ(val,i)})" filterable v-model="el.bzjid" placeholder="标准件">
                <el-option v-for="(item,key) in dropDownListData['bzj']" :key="key" :label="item.bzjmc" :value="item.bzjid">
                  <span style="float: left">{{ item.bzjmc }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ item.bzjcz }}({{item.bzjgg}})</span>
                </el-option>
              </el-select>
              数量：
              <el-input-number :controls=false v-model="el.bzjsl" :min="1" label="加工数量"></el-input-number>
              <i style="font-size:18px;" class="el-icon-circle-plus" @click="addBzj"></i>
              <i style="font-size:18px;" v-show="i !=0" class="el-icon-remove" @click="delBzj(i)"></i>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item prop="JGJ" label="选择加工件">
            <i style="font-size:18px;" class="el-icon-circle-plus" @click="addJgj"></i>
            <div v-for="(el,i) in selJgjList" :key="i">
              <el-select style="width:170px;" @change="((val)=>{changeJgj(val, i)})" filterable v-model="el.bomid" placeholder="加工件">
                <el-option v-for="(item,key) in dropDownListData['jgj']" :key="key" :label="item.zddmc" :value="item.bomid">
                  <span style="float: left">{{ item.zddmc }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">({{item.cldx}})</span>
                </el-option>
              </el-select>
              数量：
              <el-input-number :controls=false v-model="el.zjsl" :min="1" label="组件数量"></el-input-number>
              <i style="font-size:18px;" class="el-icon-circle-plus" @click="addJgj"></i>
              <i style="font-size:18px;" v-show="i !=0" class="el-icon-remove" @click="delJgj(i)"></i>
            </div>
          </el-form-item>
        </el-col>
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
  name: 'zjgl',
  props: ['dialogState'],
  data() {
    return {
      columnData: [],
      dropDownListData: {},
      primaryKey: {},
      bzjList: [],
      jgjList: [],
      selJgjList: [{}],
      selBzjList: [
        {
          id: this.$util.getUUId(),
          zjmc: '',
          zjid: this.dialogState.formData.ID,
          bzjsl: 1,
          bzjid: '',
          bzjmc: '',
          bz: ''
        }
      ],
      rules: {
        zjmc: [{ required: true, message: '请输入组件名称', trigger: 'blur' }]
      }
    }
  },
  computed: {
    optionType() {
      return this.dialogState.type
    },
    formData() {
      return this.dialogState.formData
    },
    resId() {
      return this.dialogState.id
    }
  },
  mounted() {
    this.getSjzdData(
      'ssdd',
      'SELECT id,xmname NAME FROM scglxt_t_dd where ckzt is null order by sjcjsj desc'
    )
    this.getSjzdData(
      'bzj',
      'SELECT id bzjid,ljmc bzjmc,ljcz bzjcz,ljgg bzjgg,1 as bzjsl FROM scglxt_t_bzj'
    )
  },
  methods: {
    //标准件操作
    addBzj() {
      this.selBzjList.push({
        id: this.$util.getUUId(),
        zjid: this.formData.id,
        zjmc: this.formData.zjmc,
        bzjsl: 1,
        bz: ''
      })
    },
    delBzj(i) {
      this.selBzjList.splice(i, 1)
    },
    //加工件操作
    addJgj() {
      this.selJgjList.push({
        id: this.$util.getUUId(),
        bomid: '',
        zjid: this.formData.id,
        zjmc: this.formData.zjmc,
        zjsl: 1
      })
    },
    delJgj(i) {
      this.selJgjList.splice(i, 1)
    },
    changeCZ(zjbzj, i) {
      let czArr = this.dropDownListData['bzj'].filter(item => {
        return item.bzjid == zjbzj
      })
      this.selBzjList[i]['bzjmc'] = czArr[0]['bzjmc']
    },
    changeJgj(bom, i) {
      let obj = {
        id: this.$util.getUUId(),
        bomid: bom,
        zjid: this.formData.id,
        zjmc: this.formData.zjmc,
        zjsl: 1
      }
      this.selJgjList[i] = obj
    },
    changeSSDD(val) {
      this.selJgjList = [{}]
      this.getSjzdData(
        'jgj',
        'SELECT id bomid,zddmc,cldx FROM scglxt_t_bom where ssdd=' + val
      )
    },
    onSave() {
      let params = {}
      let data = this.$refs['rulesForm'].model
      params.form = data
      this.selBzjList.map(item => {
        item.zjmc = params.form.zjmc
        item.zjid = params.form.id
      })
      this.selJgjList.map(item => {
        item.zjmc = params.form.zjmc
        item.zjid = params.form.id
      })
      params.bzj = this.selBzjList.filter(el => {
        return el.bzjid != ''
      })
      params.jgj = this.selJgjList.filter(el => {
        return el.bomid != ''
      })
      this.$refs['rulesForm'].validate(valid => {
        if (valid) {
          if (this.optionType == 'edit') {
            params.primaryKey = this.primaryKey
            this.$ajax.post(this.$api.editZj, params).then(res => {
              if (res && res.errno == 0) {
                this.$message.editSuccess()
                this.dialogState.show = false
                this.$parent.getData()
              } else {
                this.$message.editError(res.errmsg)
              }
            })
          } else if (this.optionType == 'copy') {
            //复制
              this.$ajax
                .post(this.$api.copyZjById, params)
                .then(res => {
                  if (res && res.errno == 0) {
                    this.$message.success('复制成功！')
                    this.dialogState.show = false
                    this.$parent.getData()
                  } else {
                    this.$message.error(res.data.errmsg)
                  }
                })
          } else {
            this.$ajax.post(this.$api.addZj, params).then(res => {
              if (res.errno == 0) {
                this.$message.addSuccess()
                this.dialogState.show = false
                this.$parent.getData()
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
    // 获取表单数据，如果是编辑进行数据回填
    getFormData(id) {
      this.$ajax
        .get(this.$api.getBzjByZjId, {
          id: id
        })
        .then(res => {
          if (res.errno == 0) {
            this.dialogState.formData = res.data
            this.primaryKey.id = res.data.id
            if (res.data.bzj.length > 0) {
              this.getSjzdData(
                'jgj',
                'SELECT id bomid,zddmc,cldx FROM scglxt_t_bom where ssdd=' +
                  res.data.ssdd
              )
              this.selBzjList = res.data.bzj
              this.selJgjList = res.data.jgj
            } else {
              this.selBzjList = [
                {
                  id: this.$util.getUUId(),
                  zjid: this.formData.id,
                  zjmc: this.formData.zjmc,
                  bzjsl: 1,
                  bz: ''
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
    }
  },
  watch: {
    dialogState: {
      deep: true,
      handler() {
        if (this.dialogState.show) {
          if (this.dialogState.type == 'add') {
            this.selBzjList = [
              {
                id: this.$util.getUUId(),
                zjmc: '',
                zjid: this.dialogState.formData.ID,
                bzjsl: 1,
                bz: ''
              }
            ]
            this.selJgjList = [
              {
                id: this.$util.getUUId(),
                bomid: '',
                zjid: this.formData.id,
                zjmc: this.formData.zjmc,
                zjsl: 0
              }
            ]
          }
        }
      }
    }
    // formData: {
    //   deep: true,
    //   handler(oldVal, newVal) {
    //     if (this.formData.ssdd != undefined) {
    //       this.getSjzdData(
    //         'jgj',
    //         'SELECT id bomid,zddmc,cldx FROM scglxt_t_bom where ssdd=' +
    //           newVal.ssdd
    //       )
    //     }
    //   }
    // }
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
