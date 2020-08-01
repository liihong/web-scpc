<template>
  <div class="scqktp scqktp-main">
    <el-tabs v-model="activeName"
             tab-position="left">
      <el-tab-pane label="1.定制实时看板内容"
                   name="first">
        <el-transfer 
        style="height:80vh"
        v-model="myArray"
                     filterable
                     :props="{
                      key: 'id',
                      label: 'xmname'
                    }"
                     :titles="['当前进行中订单', '实时看板']"
                     :data="sourceTree">
          <span slot-scope="{ option }">{{ option.xmname }} {{ option.mark==null ? ''  : `(${option.mark})`}}</span>

          <el-button class="transfer-footer"
                     slot="right-footer"
                     type="primary"
                     @click="handlerSaveConfig"
                     size="small">保存</el-button>
        </el-transfer>
      </el-tab-pane>
      <el-tab-pane label="2.对订单进行排序"
                   name="second">
        <div class="scqktp-table">
          <span>注意：点击拖动下列订单列表进行排序
             <el-button class="transfer-footer"
                     style="margin-left:200px;"
                     size="mini"
                     type="primary"
                     @click="handlerSaveDdOrder"
                     >排序完成，点击保存</el-button>
              <el-button size="mini"
                   @click="lookDDWorking"
                   type="primary">查看实时看板</el-button>
          </span>
         <div class="scqktp-table-list__header">
              <span style="flex:0.3">订单名称</span>
              <span style="flex:0.4">结束时间</span>
              <span style="flex:0.3">备注</span>
            </div>
          <ul class="scqktp-table-list"
              id="scqktp-table-list">
            <li class="scqktp-table-list__item"
                v-for="item in customData"
                :key="item.id">
              <div class="scqktp-table-list__item-span">
                <span style="flex:0.3">{{item.xmname}}</span>
                <span style="flex:0.3">{{item.endtime}}</span>
                <span style="flex:0.4">{{item.mark}}</span>
              </div>

            </li>
          </ul>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import Sortable from 'sortablejs'

export default {
  components: {
    draggable
  },
  name: 'scqktp',
  data() {
    return {
      activeName: 'first',
      myArray: [],
      sourceTree: [],
      customData: []
    }
  },
  async mounted() {
    this.initData()
    this.getData()
    await this.$nextTick()
    this.rowDrop()
  },
  methods: {
    async initData() {
      this.$ajax.post(this.$api.getDDWorkSpeed,{
        isCustom: true
      }).then(res => {
        if (res.errno == 0) {
          this.sourceTree = res.data
        }
      })
    },
    getData() {
      this.$ajax.get(this.$api.getCustomDDWorkData).then(res => {
        if (res.errno == 0) {
          this.customData = res.data
          if (res.data.length > 0) {
            this.customData.map(item => {
              this.myArray.push(item.id)
            })
          }
        }
      })
    },
    handlerSaveConfig() {
      this.$ajax
        .post(this.$api.setDDWorkData, {
          ids: this.myArray
        })
        .then(res => {
          if (res.errno == 0) {
            this.getData()
            this.$message.success('保存成功，可进行排序！')
          }
        })
    },
    handlerSaveDdOrder() {
      const form = this.customData.map((item, index) => {
        return {
          id: item.id,
          ddorder: index * 1 + 1
        }
      })
      this.$ajax
        .post(this.$api.setDdOrderData, {
          form: form
        })
        .then(res => {
          if (res.errno == 0) {
            this.getData()
            this.$message.success('排序成功，可查看实时看板信息！')
          }
        })
    },
    //查看订单实时看板
    lookDDWorking() {
      window.open('/dd-working')
    },
    //行拖拽
    rowDrop() {
      var _this = this
      var $ul = document.getElementById('scqktp-table-list')
      new Sortable($ul, {
        onUpdate: function(event) {
          //修改items数据顺序
          var newIndex = event.newIndex,
            oldIndex = event.oldIndex,
            $li = $ul.children[newIndex],
            $oldLi = $ul.children[oldIndex]
          // 先删除移动的节点
          $ul.removeChild($li)
          // 再插入移动的节点到原有节点，还原了移动的操作
          if (newIndex > oldIndex) {
            $ul.insertBefore($li, $oldLi)
          } else {
            $ul.insertBefore($li, $oldLi.nextSibling)
          }
          // 更新items数组
          const item = _this.customData.splice(oldIndex, 1)
          _this.customData.splice(newIndex, 0, item[0])
          // 下一个tick就会走patch更新
        },
        animation: 150
      })
    }
  },
  watch: {
    ddList() {}
  }
}
</script>
<style lang="scss">
.scqktp {
  &-main {
    margin: 20px;
    &-box {
      border: 1px solid gray;
      &__list-item {
        position: relative;
        display: block;
        cursor: move;
        padding: 0.75rem 1.25rem;
        margin-bottom: -1px;
        background-color: #fff;
        border: 1px solid rgba(0, 0, 0, 0.125);
        &:first-child {
          border-top-left-radius: 0.25rem;
          border-top-right-radius: 0.25rem;
        }
      }
    }
  }
  &-table {
    width: 700px;
    margin:10px;
    &-list {
      &__header{
        height: 40px;
        line-height: 40px;
        background: #F5F7FA;
        margin: 0;
        padding-left: 15px;
        border-top: 1px solid #EBEEF5;
        border-left: 1px solid #EBEEF5;
        border-right: 1px solid #EBEEF5;
        display: flex;
        justify-content: space-around;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        color: #000000;
        font-weight: 600;
      }
      &__item {
        position: relative;
        display: block;
        padding: 0.75rem 1.25rem;
        margin-bottom: -1px;
        background-color: #fff;
        border: 1px solid rgba(0, 0, 0, 0.125);
        &-span {
          display: flex;
          justify-content: space-between;
        }
      }
      // li:nth-child(odd){ background:#c1cacc;}
      li:nth-child(even){ background:#f4f5f7;}
      &:first-child {
        border-top-left-radius: 0.25rem;
        border-top-right-radius: 0.25rem;
      }
    }
  }
  .el-transfer-panel {
    width: 400px;
  }
  .el-transfer-panel{
    height: 100%;
    max-height:inherit;
  }
  .el-transfer-panel__body{
    height: 100%;
  }
  .el-transfer-panel__list.is-filterable{
    height: 100%;
  }
}
</style>