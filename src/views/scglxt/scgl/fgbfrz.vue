<template>
  <div class="fgbfrz">
    <el-tabs type="border-card">
      <el-tab-pane label="让步接收">
        <ResList noEdit noAdd tableId="0118" :query="{SJZT:2203}" />
      </el-tab-pane>
      <el-tab-pane label="返工">
        <ResList noEdit noAdd tableId="0118" :query="{SJZT:2201}" />
      </el-tab-pane>
      <el-tab-pane label="报废">
        <ResList noEdit noAdd tableId="0118" :query="{SJZT:2202}" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {};
</script>

<style>
.fgbfrz{
    margin:10px;
}
</style>
