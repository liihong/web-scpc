<template>
  <div class="adminUser">
    <!-- <UserForm :dialogState="formState" :groups="adminGroupList.docs"></UserForm> -->
    <el-row class="dr-datatable">
      <el-col :span="24">
        <DataTable></DataTable>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import UserForm from './userEdit'
import DataTable from './dataTable.vue'

export default {
  name: 'index',
  data() {
    return {}
  },
  components: {
    DataTable,
    UserForm
  },
  computed: {},
  mounted() {}
}
</script>

<style lang="">
</style>