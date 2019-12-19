<template>
  <div>
      <ResList tableId='010411' noAdd noEdit :query="this.$route.query" >
        <el-table-column slot="operate" fixed="left" label="操作" min-width="80" align="center">
      <template slot-scope="scope">
        <el-button-group>
          <el-button type="primary" icon="el-icon-shopping-cart-full" @click="pass(scope.row)" class="radio" :label="1">成品出库</el-button>
        </el-button-group>
      </template>
    </el-table-column>
      </ResList>
  </div>
</template>

<script>
export default {
  methods:{
    // 成品出库
    passInStore(){

    }
  }
}
</script>

<style>

</style>