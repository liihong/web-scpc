<template>
  <div class="bzscrw">
    <div class="border-card">
      <span
        @click="handleClick(item)"
        :class="{ 'active-tab': activeTab == item.id }"
        class="border-card-tab"
        v-for="(item, key) in jggyList"
        :key="key"
      >
        {{ `${item.gymc}(${Math.ceil(item.zgs / 60)}小时)` }}
      </span>
    </div>
    <ResList tableId="010401" :query="query" noEdit noAdd noTool ref="jgList">
        <template slot="GYNR" slot-scope="scope">
            <a v-if="!!scope.row.DDTZ" :href="scope.row.DDTZ" target="_blank">
            <span :style="{color:scope.row.CZRYID? 'red': ''}"> {{scope.row.GYNR_TEXT}}</span>
            </a>
            <span v-else :style="{color:scope.row.CZRYID? 'red': ''}"> {{scope.row.GYNR_TEXT}}</span>
            <i v-if="scope.row.CZRYID" class="ingIcon">
            <svg-icon icon-class="ing" />
            </i>
        </template>
    </ResList>
  </div>
</template>

<script>
export default {
  data() {
    return {
      jggyList: [],
      activeTab: '201609010949574021',
      activeItem: {},
      query: {}
    }
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      this.$ajax.get(this.$api.getJggyList).then(res => {
        if (res.errno == 0) {
          this.jggyList = res.data
        }
      })
    },
    handleClick(item) {
      this.activeItem = item
      this.activeTab = item.id
      this.query.gynr = item.id
      this.$refs.jgList.getResList()
    }
  }
}
</script>
<style>
.ingIcon {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 42px;
}
</style>
<style lang="scss" scoped>
.bzscrw {
  background: #fff;
  border: 1px solid #dcdfe6;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
  .border-card {
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    .border-card-tab {
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      border: 1px solid transparent;
      color: #909399;
      padding: 0 20px;
      height: 40px;
      line-height: 40px;
      display: inline-block;
      list-style: none;
      font-size: 14px;
      font-weight: 500;
    }
    .active-tab {
      color: #409eff;
      background-color: #fff;
      border-right-color: #dcdfe6;
      border-left-color: #dcdfe6;
    }
  }
}
</style>
