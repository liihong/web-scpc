<template>
  <div class="jgryjg">
    <ResList tableId='010401'
             :query="query"
             noTool
             noEdit
             noAdd
             ref="teamTable">
      <template slot="SSDD"
                slot-scope="scope">
        <el-badge v-show="!!scope.row.DDLEVEL"
                  :value="scope.row.DDLEVEL == '0402' ? '重要' : scope.row.DDLEVEL == '0403' ? '' : '紧急'"
                  class="item"
                  :type="scope.row.DDLEVEL == '0402' ? 'warning' : scope.row.DDLEVEL == '0403' ? 'info' : 'danger'">
          <span style="margin:0 5px;">{{scope.row.SSDD_TEXT}}</span>
        </el-badge>
      </template>
      <template slot="BOMID"
                slot-scope="scope">
        <span class="spanText"
              @click="gybpClick(scope.row)">{{scope.row.BOMID_TEXT}}</span>
      </template>
      <template slot="GYNR"
                slot-scope="scope">
        <a v-if="!!scope.row.DDTZ"
           :href="scope.row.DDTZ"
           target="_blank">
          <span :style="{color:scope.row.CZRYID? 'red': ''}"> {{scope.row.GYNR_TEXT}}</span>
        </a>
        <span v-else
              :style="{color:scope.row.CZRYID? 'red': ''}"> {{scope.row.GYNR_TEXT}}</span>
        <i v-if="scope.row.CZRYID"
           class="ingIcon">
          <svg-icon icon-class="ing" />
        </i>
      </template>
      <template slot="DQJD"
                slot-scope="scope">
        <div style="text-align:left;"
             v-html="scope.row.DQJD"></div>
      </template>
    </ResList>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'jgryjg',
  components: {
  },
  props: {
    ljzt: {
      type: String,
      default: '0501'
    }
  },
  data () {
    return {
      query: {
      }
    }
  },
  computed: {
    ...mapGetters(['fzgy']),
  },
  mounted () {
    if (this.ljzt === '0501') {
      this.query = { gynr: this.fzgy, czryid: null }
    } else {
      this.query = { gynr: this.fzgy, czryid: 'is not null' }
    }
    this.$nextTick(()=>{
      this.$refs.teamTable.getConfig()
      this.$refs.teamTable.getResList()
    })
  },
  methods: {
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
