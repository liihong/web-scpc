<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <!-- or name="fade" -->
      <!-- <router-view :key="key"></router-view> -->
      <!-- <router-view :route="$route" /> -->
      <keep-alive v-if="$route.meta.keepAlive">
        <router-view :route="$route"></router-view>
      </keep-alive>
      <router-view v-else  :key="key" :route="$route"></router-view>
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
  max-height: calc(100vh - 80px);
  position: relative;
  overflow: auto;
  /* padding: 15px; */
}
</style>
