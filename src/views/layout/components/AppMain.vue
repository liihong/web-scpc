<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <!-- or name="fade" -->
      <!-- <router-view :key="key"></router-view> -->
      <!-- <router-view :route="$route" /> -->
      <keep-alive v-if="$route.meta.keepAlive">
        <router-view  :route="$route"></router-view>
      </keep-alive>
      <router-view v-else :route="$route"></router-view>
    </transition>
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    key() {
      return this.$route.name !== undefined ? this.$route.name + +new Date() : this.$route + +new Date()
    }
  }
  // watch: {
  //    $route(){
  //      console.log(this.$route)
  //   }
  // }
}
</script>

<style scoped>
.app-main {
  /*50 = navbar  */
  min-height: calc(100vh - 50px);
  position: relative;
  overflow: hidden;
  padding: 15px;
}
</style>
