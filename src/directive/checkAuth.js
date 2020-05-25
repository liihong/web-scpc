import store from '../store'
export default {
        install: function (Vue) {
            Vue.directive("checkAuth", {
                bind(el, binding) {
                    let auth = store.state.auth;
                    let id = binding.value.toString()
                    auth = auth.split(',')
                    if(!auth.includes(id)){
                        el.style.display = 'none'
                    }
                },
            })
        }
    }