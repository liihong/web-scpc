<template>
    <div class="dashboard-container">
        <component :is="activeComp"></component>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import mainWork from './mainWork.vue'
import teamWork from './teamWork.vue'
export default {
  name: 'Dashboard',
  components: {
    mainWork:mainWork,
    teamWork:teamWork
  },
  computed: {
    ...mapGetters(['name', 'roles','component'])
  },
  data() {
    return {
      activeComp:null
    }
  },
  mounted() {
    if(this.component === 'teamWork'){
      this.activeComp = teamWork
    }else{
      this.activeComp = mainWork
    }
  },
  methods: {}
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard {
  &-container {
    .projectAll {
      display: flex;
    }
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
