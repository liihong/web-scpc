<template>
    <div>
        <el-table class="el-table" :data="tableDatas" stripe border max-height="500px" style="width: 100%;">
      <el-table-column v-for="(row,index) in columnDatas" :key="index" :prop="row.id" align="center" :fixed="(row.frozen == 1?'left':false)" :label="row.name" :min-width="(row.length != '')?row.length:150">
        <template slot-scope="scope">
          <slot v-if="row.slot" :row="scope.row" :index="scope.$index" :name="row.slot"></slot>
          <span v-else>{{scope.row[row.id]}}</span>
        </template>
      </el-table-column>
    </el-table>
    </div>
</template>

<script>
export default {
    data(){
        return{
            columnDatas: [{
                id: 'ssht',
                name: '所属合同'
            },{
                id: 'ddbh',
                name: '订单编号'
            },{
                id: 'ddzt',
                name: '状态'
            },{
                id: 'ddjb',
                name: '级别'
            },{
                id: 'ddjd',
                name: '进度'
            }],
            tableDatas:[]
        }
    }
}
</script>

<style>

</style>
