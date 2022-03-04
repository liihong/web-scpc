<template>
  <el-dialog :title="`检验${dialogState.type =='part' ? '部分' : '全部'}打回`" :visible.sync="dialogState.show" width="30%">
    <div class="title">
      <span>
        订单号：
        <span style="color:#42b983">{{row.SSDD_TEXT}} </span>
        零件名称：
        <span style="color:#42b983">{{row.BOMID_TEXT}} </span>
      </span>
    </div>
    <div class="form">
      <el-form :model="params" :rules="rules" ref="dhForm">
        <el-form-item prop="sjzt" label="打回状态">
          <el-select :disabled="dialogState.type == 'noPass'" v-model="params.sjzt" placeholder="请选择">
            <el-option :key="0" label="返工" value="2201">
            </el-option>
            <el-option :key="1" label="报废" value="2202">
            </el-option>
             <el-option :key="2" label="材料报废" value="2203">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="dhjs" :label="`${params.sjzt=='2201'?'打回':'报废'}件数`">
          <el-input-number  v-model="params.dhjs" label="打回件数"></el-input-number><br/>
        </el-form-item>
        <el-form-item prop="dhyy" :label="`${params.sjzt=='2201'?'打回':'报废'}原因`">
          <el-input v-model="params.dhyy" />
        </el-form-item>
        <el-form-item>
          <el-button @click="passPart" class="namesBtn" type="primary">确定{{`${params.sjzt=='2201'?'打回':'报废'}`}}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    dialogState: {
      type: Object
    },
    isBF:{
      type: Boolean,
      default:false
    }
  },
  data() {
    return {
      params: {
        sjzt: '2201',
        dhjs: 0,
        dhyy: ''
      },
      rules: {
        dhjs: [{ required: true, message: '请输入打回件数', trigger: 'blur' }],
        dhyy: [{ required: true, message: '请输入打回原因', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters(['token']),
    row() {
      return this.dialogState.row
    }
  },
  methods: {
    passPart() {
      if(this.params.dhjs > this.row.SJJS){
        this.$message.warning('打回件数不能大于送检件数')
        return
      }
      this.$refs['dhForm'].validate(valid => {
        if (valid) {
          this.params.id = this.row.ID
          this.params.gygcid = this.row.gygcid
          this.params.jyryid = this.token
          this.params.bomid = this.row.BOMID
          this.params.jgjs = this.row.SJJS
          this.params.yjgjs = this.row.YJGJS
          this.params.serial = this.row.serial
          this.params.iszj = this.row.ISZJ //是否是终检操作

          if (this.dialogState.type == 'part') {
            if(this.params.sjzt == '2203')// 如果是材料报废
            {
              this.$ajax
              .post(this.$api.jyScrap, this.params)
              .then(res => {
                if (res.errno == 0) {
                  this.$message.success('材料报废成功')
                  this.dialogState.show = false
                  this.$parent.initData()
                }
              })
            }else{
              this.$ajax
              .post(this.$api.gygxCheckPassPart, this.params)
              .then(res => {
                if (res.errno == 0) {
                  this.$message.success('部分质检成功！')
                  this.dialogState.show = false
                  this.$parent.initData()
                }
              })
            }
            
          } else {// 全部打回
            this.$ajax
              .post(this.$api.gygxCheckNoPass, this.params)
              .then(res => {
                if (res.errno == 0) {
                  this.$message.success('全部打回成功！')
                  this.dialogState.show = false
                  this.$parent.initData()
                }
              })
          }
        }
      })
    }
  },
  watch: {
    dialogState: {
      deep: true,
      handler() {
        if (this.dialogState.show) {
          this.params.dhjs = this.dialogState.row.SJJS
          this.params.sjzt = this.dialogState.sjzt
        }
      }
    },
    isBF(){
      if(this.isBF){
        this.params.sjzt = '2202'
      }
    }
  }
}
</script>

<style>
</style>
