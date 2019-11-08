<template>
  <el-dialog title="工艺编排" :visible.sync="dialogState.show" width="80%">
    <div class="title">
      <span v-if="type == 'edit'">
        当前订单：
        <span style="color:#42b983">{{row.SSDD_TEXT}} </span>
        零件名称：
        <a :href="row.DDTZ" target="_blank">
          <span style="color:#42b983"> {{row.ZDDMC}}</span>
        </a>
      </span>
      <span v-else>
        零件名称：
        <a :href="row.DDTZ" target="_blank">
          <span style="color:#42b983">{{row.BOMID_TEXT}}</span>
        </a>
      </span>
    </div>
    <el-row>
      <el-col v-show="type == 'edit'" :span="22">
        <draggable class="list-group" v-model="jggyList" :options="{draggable:'.el-tag',filter: '.undraggable', sort: false}" :move="getdata" @end="drop" @update="datadragEnd">
          <el-tag class="elTag" v-for="(item,index) in jggyList" :value="item.id" :name="item.gymc" :key="index">{{item.gymc}}</el-tag>
        </draggable>
      </el-col>
      <el-col v-show="type == 'edit'" :span="2">
        <el-button @click="onSave" size="mini" type="primary">保存并关闭</el-button>
      </el-col>
      <el-col v-if="type == 'edit'" :span="24">
        选择标准流程：
        <el-select filterable @change="changeBzlc" size="mini" v-model="activeBz" placeholder="请选择">
          <el-option v-for="item in bzList" :key="item.id" :label="item.gybzmc" :value="item.id">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="24">
        <el-table :data="gygxList" class="gygxTable" id="gygxTable" row-key="id">
          <el-table-column min-width="20" align="center" v-if="type == 'edit'" property="gxnr" label="删除">
            <template slot-scope="scope">
              <el-button @click="deleteGy(scope.$index,scope.row)" size="mini" type="danger" icon="el-icon-delete" circle></el-button>
            </template>
          </el-table-column>
          <el-table-column width="30" type="index" align="center"></el-table-column>
          <el-table-column class-name="gxnr" align="center" property="gxnr" label="工序" min-width="50">
            <template slot-scope="scope">
              <!-- <span>{{scope.row['gymc']}}</span> -->
              <el-select @change="changeGygx(item)" size="mini" v-model="scope.row['gynr']" placeholder="请选择">
                <el-option v-for="item in jggyList" :key="item.id" :label="item.gymc" :value="item.id">
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column property="sbid" label="设备类型" min-width="70">
            <template slot-scope="scope">
              <el-select v-if="type == 'edit'" size="mini" v-model="scope.row['sbid']" placeholder="请选择">
                <el-option v-for="item in scope.row['sblxList']" :key="item.id" :label="item.mc" :value="item.id">
                </el-option>
              </el-select>
              <span v-else>{{scope.row['sbmc']}}</span>
            </template>
          </el-table-column>
          <el-table-column property="edgs" label="额定工时(分钟)" min-width="70">
            <template slot-scope="scope">
              <el-input-number v-if="type == 'edit'" :controls=false size="mini" v-model="scope.row['edgs']" :min="0" label="额定工时"></el-input-number>
              <span v-else>{{scope.row['edgs']}}</span>
            </template>
          </el-table-column>
          <el-table-column property="bzgs" label="总工时(分钟)" min-width="70">
            <template slot-scope="scope">
              <el-input-number v-if="type == 'edit'" :controls=false size="mini" v-model="scope.row['bzgs']" :min="0" label="标准工时"></el-input-number>
              <span v-else>{{scope.row['bzgs']}}</span>
            </template>
          </el-table-column>
          <el-table-column property="zbgs" label="准备工时" min-width="70">
            <template slot-scope="scope">
              <el-input-number v-if="type == 'edit'" :controls=false size="mini" v-model="scope.row['zbgs']" :min="0" label="准备工时"></el-input-number>
              <span v-else>{{scope.row['zbgs']}}</span>
            </template>
          </el-table-column>
          <el-table-column property="zysx" label="工艺内容" min-width="250">
            <template slot-scope="scope">
              <el-input v-if="type == 'edit'" size="mini" type="textarea" :rows="2" v-model="scope.row['zysx']" placeholder="请输入内容"></el-input>
              <span v-else>{{scope.row['zysx']}}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

  </el-dialog>
</template>

<script>
import draggable from 'vuedraggable'
import Sortable from 'sortablejs'
export default {
  components: {
    draggable
  },
  props: ['dialogState'],
  computed: {
    row() {
      return this.dialogState.row
    },
    type() {
      return this.dialogState.type
    },
    bomid() {
      if (this.type == 'edit') {
        return this.dialogState.row['ID']
      } else {
        return this.dialogState.row['BOMID']
      }
    }
  },
  data() {
    return {
      isShow: false,
      activeBz: '',
      bzList: [],
      sjzdList: [],
      jggyList: [],
      gygxList: [],
      gxObj: {
        id: this.$util.getUUId(),
        gynr: '',
        edgs: 0,
        serial: 0,
        sbid: '',
        zysx: '',
        bzgs: 0,
        zbgs: 0,
        sblxList: []
      }
    }
  },
  mounted() {
    this.initData()
    this.getBzData()
    if (this.dialogState.show) {
      this.showDialog()
    }
  },
  methods: {
    //行拖拽
    rowDrop() {
      const tbody = document.querySelector(
        '.gygxTable .el-table__body-wrapper tbody'
      )
      const _this = this
      Sortable.create(tbody, {
        group: '.gxnr',
        handle: '.gxnr',
        onEnd({ newIndex, oldIndex }) {
          const currRow = _this.gygxList.splice(oldIndex, 1)[0]
          _this.gygxList.splice(newIndex, 0, currRow)
        }
      })
    },
    initData() {
      this.$ajax.get(this.$api.getJggyList).then(res => {
        if (res.errno == 0) {
          this.jggyList = res.data
        }
      })
      this.$ajax.get(this.$api.getSblxList).then(res => {
        if (res.errno == 0) {
          this.sjzdList = res.data
        }
      })
    },
    //删除
    deleteGy(index,row) {
      let id = row.id
       this.$message.confirm('谨慎删除，若已开始加工则只能进行修改',() => {
         this.$ajax
        .post(this.$api.deleteGygx,{id:id}).then((res)=>{
          if (res.errno == 0) {
            this.gygxList.splice(index, 1)
          } else {
            this.$message.error(res.data)
          }
        })
       })
    },
    onSave() {
      let datas = this.gygxList.map((item, index) => {
        item.serial = index
        item.ssdd = this.row.SSDD
        delete item.sblxList
        return item
      })
      this.$ajax
        .post(this.$api.saveGygxInfo, {
          form: datas,
          ssdd: this.row.SSDD
        })
        .then(res => {
          if (res.errno == 0) {
            this.$message.success()
            this.$refs
            this.dialogState.show = false
            this.$parent.$refs.resList.getResList()
          } else {
            this.$message.error()
          }
        })
    },
    getdata(val) {
      console.log(val)
    },
    datadragEnd() {},
    drop(info) {
      let item = info.item.attributes
      let sblx = this.sjzdList.filter(el => {
        return el.ssgy == item.value.nodeValue
      })
      if (sblx.length == 0) {
        sblx[0] = {
          id: ''
        }
      }
      this.gygxList.push({
        id: this.$util.getUUId(),
        gynr: item.value.nodeValue,
        gymc: item.name.nodeValue,
        bomid: this.row.ID,
        ssdd: this.row.SSDD,
        edgs: 0,
        serial: this.gygxList.length,
        sbid: sblx[0].id || '',
        zysx: '',
        bzgs: 0,
        zbgs: 0,
        sblxList: sblx || []
      })
    },
    //切换标准流程
    changeBzlc(val) {
      this.$ajax
        .get(this.$api.getGyByBzId, {
          bzid: val
        })
        .then(res => {
          if (res.errno == 0) {
            this.gygxList = res.data
            this.gygxList.map(item => {
              let sblx = this.sjzdList.filter(el => {
                return el.ssgy == item.gynr
              })
              item.id = this.$util.getUUId()
              item.bomid = this.bomid
              item.sblxList = sblx
              return item
            })
          }
        })
    },
    showDialog() {
      const vm = this
      this.$nextTick(() => {
        this.$ajax
          .get(this.$api.getJggxByBOMId, {
            bomid: this.bomid
          })
          .then(res => {
            if (res.errno == 0) {
              this.gygxList = res.data

              this.gygxList.map(item => {
                let sblx = this.sjzdList.filter(el => {
                  return el.ssgy == item.gynr
                })
                item.sblxList = sblx
                return item
              })
              this.$nextTick(() => {
                vm.rowDrop()
              })
            } else {
              this.$message.error('请求工艺后台报错')
            }
          })
      })
    },
    // 获取数据字典数据
    getBzData() {
      this.$ajax.get(this.$api.getGyBzList).then(res => {
        if (res.errno == 0) {
          this.bzList = res.data
        }
      })
    }
  },
  watch: {
    dialogState: {
      deep: true,
      handler() {
        if (this.dialogState.show) {
          this.showDialog()
          this.activeBz = ''
        }
      }
    }
  }
}
</script>

<style scoped>
.elTag {
  margin: 5px;
  cursor: move;
}
.el-input-number--mini >>> {
  width: 80px;
}
</style>
