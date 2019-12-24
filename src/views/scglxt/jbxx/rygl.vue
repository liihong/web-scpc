<template>
  <div class="rygl">
    <ResList tableId="0107" @deleteAfter="deleteUser" @saveAfter="addCMS_User" />
  </div>
</template>

<script>
import services from "@/api/user";
import {getUUId} from '@/utils/index'
import md5 from 'js-md5'

export default {
  methods: {
    addCMS_User(info) {
      if (info.type == "add") {
        let data = {
          id:info.data.id,
          name:info.data.rymc,
          username:info.data.rymc,
          roles:info.data.ssbz,
          password:md5(info.data.password),
          isenabled:1
        }
        services.addUser(data)
      } else {
        let params = {
          id:info.data.id,
          data:{
            name:info.data.rymc,
            username:info.data.rymc,
            roles:info.data.ssbz,
            password:md5(info.data.password)
          }
        }
        services.editUser(params)
      }
    },
    deleteUser(id){
      console.log(id)
        services.deleteUser({
          id:id
        })
    }
  }
};
</script>
