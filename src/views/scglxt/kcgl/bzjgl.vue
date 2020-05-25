<template>
    <div>
        <ResList ref="bzjgl" tableId='0116' :query="this.$route.query" >
            <div class="toolBar" slot="toolBar">
                  <el-button icon="el-icon-sold-out" type="warning" @click="inStore">入库</el-button>
                  <el-button icon="el-icon-sell" type="danger" @click="outStore">出库</el-button>
            </div>
        </ResList>
        <bzjrk :isInStore="isStoreShow"></bzjrk>
        <bzjck :isOutStore="isOutStoreShow"></bzjck>
    </div>
</template>

<script>
import bzjrk from './components/bzjrk.vue'
import bzjck from './components/bzjck.vue'
export default {
    components:{
        bzjrk:bzjrk,
        bzjck:bzjck
    },
    data(){
        return {
            isStoreShow:{
                show:false
            },
            isOutStoreShow:{
                show:false
            }
        }
    },
    methods:{
        inStore(){
            this.isStoreShow.show = true
        },
        outStore(){
            this.isOutStoreShow.show = true
        }
    }
}
</script>

<style lang="scss">
.toolBar{
    display: inline-block;
}
</style>
