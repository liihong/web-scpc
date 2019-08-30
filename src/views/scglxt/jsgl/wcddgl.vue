<template>
  <div class="ddgl">
    <ResList tableId='0114' noEdit>
       <template slot="SSHT" slot-scope="scope">
        <router-link style="color:#48b884;" :to="{path: 'htgl', query: {HTBH: scope.row.SSHT}}">{{scope.row.SSHT_TEXT}}</router-link>
      </template>
      <template slot="XMNAME" slot-scope="scope">
        <router-link style="color:#48b884;" :to="{path: 'bomgl', query: {SSDD: scope.row.ID, SSHT: scope.row.SSHT}}">{{scope.row.XMNAME}}</router-link>
      </template>
      <template slot="DDLEVEL" slot-scope="scope">
        <el-tag effect='dark' :type="scope.row.DDLEVEL == '0402' ? 'warning' : scope.row.DDLEVEL == '0403' ? '' : 'danger'">{{scope.row.DDLEVEL_TEXT}}</el-tag>
      </template>
    </ResList>
  </div>
</template>

<script>
export default {
  name: 'ddgl'
}
</script>
