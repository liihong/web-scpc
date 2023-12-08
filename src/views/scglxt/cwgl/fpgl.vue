<template>
  <div class="invoice-class">
    <div>发票管理</div>
    <el-button type="primary" @click="addInvoice">开发票</el-button>

    <addInvoice :isShow.sync="isShow" />
  </div>

</template>

<script>
import addInvoice from './components/addInvoice'
export default {
  components:{addInvoice},
  props: {
    
  },
  data() {
    return {
      isShow:false
    };
  },
  methods:{
    addInvoice(){
      this.isShow = true
    }
  }
}
</script>

<style  lang="scss" scoped>
.invoice-class{

}
</style>