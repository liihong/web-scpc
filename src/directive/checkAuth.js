import store from '../store'
export default {
        install: function (Vue) {
            Vue.directive("checkAuth", {
                bind(el, binding) {
                    let auth = store.state.user.roles;
                    let id = binding.value.toString()
                    auth = auth.join(',')
                    if(!id.includes(auth)){
                        el.style.display = 'none'
                        return false
                    }else{
                        return true
                    }
                },
            })
        }
    }