<template>
  <div>
    <el-menu class="navbar" mode="horizontal">
      <hamburger
        :toggle-click="toggleSideBar"
        :is-active="sidebar.opened"
        class="hamburger-container"
      />
      <breadcrumb />
      <div class="avatar-container">
        <!-- <el-badge :value="12" class="el-icon-message-solid-badge"> -->
        <i @click="dialogShow = true" class="cake el-icon-message-solid"></i>
        <!-- </el-badge> -->
        <el-dropdown trigger="click">
          <div class="avatar-wrapper">
            {{name}},{{roleNames[0]}}
            <img
              :src="avatar+'?imageView2/1/w/80/h/80'"
              class="user-avatar"
            />
            <i class="el-icon-caret-bottom" />
          </div>
          <el-dropdown-menu slot="dropdown" class="user-dropdown">
             <el-dropdown-item>
              <span @click="goPersonal">个人中心</span>
            </el-dropdown-item>
            <el-dropdown-item>
              <span @click="isShow = true">修改密码</span>
            </el-dropdown-item>
            <el-dropdown-item divided>
              <span style="display:block;" @click="logout">退出</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-menu>
    <Version :dialogShow="dialogShow" />
    <el-dialog title="修改密码" v-if="isShow" :visible.sync="isShow" width="30%">
      <el-form :model="form">
        <el-form-item label="原密码">
          <el-input v-model="form.oldPassword" type="password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="form.password" type="password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="再次输入密码">
          <el-input v-model="form.newPassword" type="password" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShow = false">取 消</el-button>
        <el-button type="primary" @click="updatePwd">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Breadcrumb from "@/components/Breadcrumb";
import Hamburger from "@/components/Hamburger";
import Version from './Version.vue'
import md5 from "js-md5";
export default {
  components: {
    Breadcrumb,
    Hamburger,
    Version
  },
  data() {
    return {
      isShow: false,
      dialogShow: false,
      form: {}
    };
  },
  computed: {
    ...mapGetters(["sidebar", "avatar", "name", "roleNames"])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch("ToggleSideBar");
    },
    async updatePwd() {
      if (this.form.password != this.form.newPassword) {
        this.$message({
          message: "两次密码输入不一致",
          type: "error"
        });
        return;
      }
      let params = new FormData();
      params.append("password", md5(this.form.password));
      params.append("oldPassword", md5(this.form.oldPassword));
      params.append("newPassword", md5(this.form.newPassword));
      let res = await this.$ajax.post("/user/updatePwd", params);
      if (res.errno == 0) {
        this.isShow = false;
        this.$message({
          message: "密码修改成功",
          type: "success"
        });
      }
    },
    logout() {
      this.$store.dispatch("LogOut").then(() => {
        location.reload(); // 为了重新实例化vue-router对象 避免bug
      });
    },
    goPersonal(){
      this.$router.push({path:'personal'})
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.navbar {
  height: 50px;
  line-height: 50px;
  border-radius: 0px !important;
  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    padding: 0 10px;
  }
  .screenfull {
    position: absolute;
    right: 90px;
    top: 16px;
    color: red;
  }
  .avatar-container {
    height: 50px;
    display: inline-block;
    position: absolute;
    right: 35px;
    .el-icon-message-solid-badge {
      color: #42b983;
      margin-right: 20px;
      font-size: 21px;
    }
    .avatar-wrapper {
      cursor: pointer;
      margin-top: 5px;
      position: relative;
      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 10px;
      }
      .el-icon-caret-bottom {
        position: absolute;
        right: -20px;
        top: 25px;
        font-size: 12px;
      }
    }
  }
}
.cake {
  color: #42b983;
  margin-right: 20px;
  font-size: 21px;
  animation: move 3s 0s infinite;
  -webkit-animation: move 3s 0s infinite;
  transform-origin: bottom;
  -webkit-transform-origin: bottom;
}
@keyframes move {
  0%,
  65% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  70% {
    -webkit-transform: rotate(6deg);
    transform: rotate(6deg);
  }
  75% {
    -webkit-transform: rotate(-6deg);
    transform: rotate(-6deg);
  }
  80% {
    -webkit-transform: rotate(6deg);
    transform: rotate(6deg);
  }
  85% {
    -webkit-transform: rotate(-6deg);
    transform: rotate(-6deg);
  }
  90% {
    -webkit-transform: rotate(6deg);
    transform: rotate(6deg);
  }
  95% {
    -webkit-transform: rotate(-6deg);
    transform: rotate(-6deg);
  }
  100% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
}
@-webkit-keyframes move {
  0%,
  65% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  70% {
    -webkit-transform: rotate(6deg);
    transform: rotate(6deg);
  }
  75% {
    -webkit-transform: rotate(-6deg);
    transform: rotate(-6deg);
  }
  80% {
    -webkit-transform: rotate(6deg);
    transform: rotate(6deg);
  }
  85% {
    -webkit-transform: rotate(-6deg);
    transform: rotate(-6deg);
  }
  90% {
    -webkit-transform: rotate(6deg);
    transform: rotate(6deg);
  }
  95% {
    -webkit-transform: rotate(-6deg);
    transform: rotate(-6deg);
  }
  100% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
}
</style>

