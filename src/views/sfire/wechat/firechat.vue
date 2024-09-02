<template>
    <div class="rygl">
      <ResList tableId="9901" />
    </div>
  </template>
  
  <script>
  import services from "@/api/user";
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
      editCMS_User(info){
        let params = {
            id:info.id,
            data:{
              name:info.rymc,
              username:info.rymc,
              roles:info.ssbz,
              password:md5(info.password)
            }
          }
          services.editUser(params)
      },
      deleteUser(id){
          services.deleteUser({
            id:id
          })
      }
    }
  };
  </script>
  