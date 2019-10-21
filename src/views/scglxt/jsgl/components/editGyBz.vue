<template>
  <el-dialog title="工艺编排" :visible.sync="dialogState.show" width="70%">
    <el-row>
      <el-col v-show="type == 'edit'" :span="22">
        <draggable class="list-group" v-model="jggyList" :options="{draggable:'.el-tag'}" :move="getdata" @end="drop" @update="datadragEnd">
          <el-tag class="elTag" v-for="(item,index) in jggyList" :value="item.id" :name="item.gymc" :key="index">{{item.gymc}}</el-tag>
        </draggable>
      </el-col>
      <el-col v-show="type == 'edit'" :span="2">
        <el-button @click="onSave" size="mini" type="primary">保存并关闭</el-button>
      </el-col>
      <el-col :span="24">
        <draggable class="table-group" v-model="gygxList" :options="{draggable:'.row'}" @update="datadragEnd">
          <el-table :data="gygxList">
            <el-table-column v-if="type == 'edit'" property="gxnr" label="删除" min-width="50">
              <template slot-scope="scope">
                <el-button @click="deleteGy(scope.$index)" size="mini" type="danger" icon="el-icon-delete" circle></el-button>
              </template>
            </el-table-column>
            <el-table-column property="gxnr" label="工序" min-width="50">
              <template slot-scope="scope">
                <span>{{scope.row['gymc']}}</span>
              </template>
            </el-table-column>
            <el-table-column property="sbid" label="设备类型" min-width="100">
              <template slot-scope="scope">
                <el-select v-if="type == 'edit'" size="mini" v-model="scope.row['sbid']" placeholder="请选择">
                  <el-option v-for="item in scope.row['sblxList']" :key="item.id" :label="item.mc" :value="item.id">
                  </el-option>
                </el-select>
                <span v-else>{{scope.row['sbmc']}}</span>
              </template>
            </el-table-column>
            <!-- <el-table-column property="sszj" label="所属组件" min-width="100">
              <template slot-scope="scope">
                <el-input v-if="type == 'edit'" size="mini" v-model="scope.row['sszj']" label="所属组件"></el-input>
                <span v-else>{{scope.row['sszj']}}</span>
              </template>
            </el-table-column> -->
            <el-table-column property="edgs" label="额定工时(分钟)" min-width="100">
              <template slot-scope="scope">
                <el-input-number v-if="type == 'edit'" :controls=false size="mini" v-model="scope.row['edgs']" :min="0" label="额定工时"></el-input-number>
                <span v-else>{{scope.row['edgs']}}</span>
              </template>
            </el-table-column>
            <el-table-column property="bzgs" label="总工时(分钟)" min-width="100">
              <template slot-scope="scope">
                <el-input-number v-if="type == 'edit'" :controls=false size="mini" v-model="scope.row['bzgs']" :min="0" label="标准工时"></el-input-number>
                <span v-else>{{scope.row['bzgs']}}</span>
              </template>
            </el-table-column>
            <el-table-column property="zbgs" label="准备工时" min-width="80">
              <template slot-scope="scope">
                <el-input-number v-if="type == 'edit'" :controls=false size="mini" v-model="scope.row['zbgs']" :min="0" label="准备工时"></el-input-number>
                <span v-else>{{scope.row['zbgs']}}</span>
              </template>
            </el-table-column>
            <el-table-column property="zysx" label="工艺内容" min-width="200">
              <template slot-scope="scope">
                <el-input v-if="type == 'edit'" size="mini" type="textarea" :rows="2" v-model="scope.row['zysx']" placeholder="请输入内容"></el-input>
                <span v-else>{{scope.row['zysx']}}</span>
              </template>
            </el-table-column>
          </el-table>
        </draggable>
      </el-col>
    </el-row>

  </el-dialog>
</template>

<script>
import draggable from 'vuedraggable'
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
    bzid() {
      return this.dialogState.row['id']
    }
  },
  data() {
    return {
      isShow: false,
      sjzdList: [],
      jggyList: [],
      gygxList: [],
      gxObj: {
        id: this.$util.getUUId(),
        ssbz: this.ssbz,
        gynr: '',
        edgs: 0,
        serial: 0,
        sbid: '',
        zysx: '',
        bzgs: 0,
        zbgs: 0,
        status: 0,
        sblxList: []
      }
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
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
    deleteGy(index) {
      this.gygxList.splice(index, 1)
    },
    onSave() {
      let datas = this.gygxList.map((item, index) => {
        item.serial = index
        delete item.sblxList
        return item
      })
      this.$ajax
        .post(this.$api.addGyBzMany, {
          form: datas
        })
        .then(res => {
          if (res.errno == 0) {
            this.$message.success()
            this.dialogState.show = false
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
      if(sblx.length == 0){
        sblx[0] = {
          id: ''
        }
      }
      this.gygxList.push({
        id: this.$util.getUUId(),
        ssbz: this.dialogState.row.id,
        gynr: item.value.nodeValue,
        gymc: item.name.nodeValue,
        edgs: 0,
        serial: 0,
        sbid: sblx[0].id || '',
        zysx: '',
        bzgs: 0,
        zbgs: 0,
        sblxList: sblx || []
      })
    },
    showDialog() {
      this.isShow = true
      this.$nextTick(() => {
        this.$ajax
          .get(this.$api.getGyByBzId, {
            bzid: this.dialogState.row.id
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
            } else {
              this.$message.error('请求工艺后台报错')
            }
          })
      })
    }
  },
  watch: {
    dialogState: {
      deep: true,
      handler() {
        if (this.dialogState.show) {
          this.showDialog()
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
