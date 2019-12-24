const Base = require('./base.js');
const util = require('../../utils/util')
let userModel = 'cms_user'
module.exports = class extends Base {
    async indexAction() {
        let data = await this.model(userModel).select()
        return this.success(data)
    }
    // 处理登录
    async loginAction() {
        try {
            let model = this.model(userModel)
            let ip = this.ip;
            let data = await model.where({
                username: this.post('username'),
                password: this.post('password')
            }).find()
            if (JSON.stringify(data) !== '{}') {
                // 更新在线状态
                let affectedRows = await model.where({
                    id: data.id
                }).update({
                    lastlogintime: new Date().toLocaleString(),
                    token: data.id,
                    ip: ip.split(':')[3]
                });
                data = await model.where({
                    id: data.id
                }).find()
                return this.success(data)
            } else {
                return this.fail(1000, '用户名或密码错误', {})
            }
        } catch (ex) {
            return this.fail(ex)
        }

    }
    // 注销登录
    async logoutAction() {
        try {
            let model = this.model(userModel)
            let affectedRows = await model.where({
                token: this.get('token')
            }).update({
                token: '',
                ip: ''
            });
            return this.success(affectedRows)
        } catch (ex) {
            return this.fail(ex)
        }
    }
    // 通过id获取用户信息
    async infoAction() {
        try {
            let rolesNames = []

            let data = await this.model(userModel).where({
                id: this.get('token')
            }).find()
            // 获取用户权限
            if(data.roles) {
                let roles = await this.model('cms_role').field(['roleName']).where({
                    roleId: ['in', data.roles]
                }).select()
                roles.forEach(element => {
                    rolesNames.push(element.roleName)
                });
            }
            let fzgy = await this.model('scglxt_t_jggy').field('id').where({fzbz: data.roles}).find()
            data.roles = [data.roles]
            data.rolesNames = rolesNames
            if(!!fzgy){
                data.fzgy = fzgy.id
            }else{
                data.fzbz = ''
            }
            return this.success(data)
        } catch (ex) {
            return this.fail(2000, '权限获取失败！', {})
        }
    }
    // 获取当前用户的菜单权限列表
    async menuAction() {
        try {
            let roless = []

            let data = await this.model('cms_resource').join('cms_role_resource ON cms_resource.resId=cms_role_resource.resId').where({
                roleId: this.get('token')
            }).order('resOrder + 0 asc').select()
            return this.success(data)
        } catch (ex) {
            return this.fail(2000, '菜单获取失败！', {})
        }
    }

    // 修改密码
    async updatePwdAction() {
        try{
            let {oldPassword,password} = this.post()
            let token = this.header('token'); 
            let data = await this.model('cms_user').where({token:token}).find()
            let sussData = {}
            if(data.password == oldPassword) {
                sussData = await this.model('cms_user').where({token:token}).update({
                    password: password
                })
                
                return this.success(sussData)
            }else{
                return this.fail(1000, '原密码不正确', {})
            }

        } catch (ex) {
            return this.fail(2000, '密码修改失败！', {})
        }
    }

    //新增用户
    async addAction(){
        let data = this.post('data')
        let status = await this.model('cms_user').add(data)
        return this.success(status)
    }

    //编辑用户
    async eidtAction(){
        let id = this.post('id')
        let update = this.post('data')
        let status = await this.model('cms_user').where({id:id}).update(update)
        return this.success(status)
    }

    //删除用户
    async deleteAction(){
        let id = this.post('id')
        let status = await this.model('cms_user').where({id:id}).delete()
        return this.success(status)
    }
};