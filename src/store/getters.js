const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  routers: state => state.user.routers,
  roleNames: state => state.user.roleNames,
  fzgy: state => state.user.fzgy,
  isfzr: state => state.user.isfzr,
  component: state => state.user.component
}
export default getters
