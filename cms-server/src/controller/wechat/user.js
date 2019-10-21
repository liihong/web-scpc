const Base = require('../base.js');
const util = require('../../../utils/util')
let userModel = 'cms_user'
module.exports = class extends Base {

    // 微信登录接口
    async loginAction() {
        try {
            let model = this.model(userModel)
            let ip = this.ip;
            let data = await model.where({
                username: this.post('username'),
                password: this.post('password')
            }).find()
           
            if (JSON.stringify(data) !== '{}') {
                let wxcode = this.post('wxcode')
                let wxavatar = this.post('wxavatar')
                let updateObj = {
                    lastlogintime: new Date().toLocaleString(),
                    token: data.id,
                    ip: ip.split(':')[3]
                }
                if(wxcode!= '') {
                    updateObj.wxcode = wxcode
                }
                if(wxavatar!= '') {
                    updateObj.photo = wxavatar
                }
                // 更新在线状态
                let affectedRows = await model.where({
                    id: data.id
                }).update(updateObj);
                data = await model.field('name,token,photo,roles bzid,(select roleName from cms_role where roleId = roles) bzmc').where({
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

    //获取某个人任务统计信息
    async getTaskStatAction() {
        let userToken = this.header('token')
        let data = {
            hour:{}
        }
        let daySql = `select sum(jggl.jgjs*(gygc.edgs/gygc.kjgjs)) sum from scglxt_t_jggl jggl,scglxt_t_gygc gygc WHERE ( jggl.gygcid=gygc.id and  jgryid ='`+ userToken +`' and to_days(jgjssj) = to_days(now()) )`
        let day  = await this.model().query(daySql)
        data.hour.day = day[0].sum == null ? 0 : day[0].sum
        let weekSql = `select sum(jggl.jgjs*(gygc.edgs/gygc.kjgjs)) sum from scglxt_t_jggl jggl,scglxt_t_gygc gygc WHERE ( jggl.gygcid=gygc.id and  jgryid ='`+ userToken +`' and DATE_SUB(CURDATE(), INTERVAL 7 DAY) <= date(jgjssj) )`
        
        let week = await this.model().query(weekSql)
        data.hour.week = week[0].sum == null ? 0 : week[0].sum
        let monthSql = `select sum(jggl.jgjs*(gygc.edgs/gygc.kjgjs)) sum from scglxt_t_jggl jggl,scglxt_t_gygc gygc WHERE ( jggl.gygcid=gygc.id and  jgryid ='`+ userToken +`' and DATE_FORMAT( jgjssj, '%Y%m' ) = DATE_FORMAT( CURDATE( ) , '%Y%m' ) )`
        
        let month = await this.model().query(monthSql)
        data.hour.month = month[0].sum == null ? 0 : month[0].sum
        return this.success(data)
    }
};