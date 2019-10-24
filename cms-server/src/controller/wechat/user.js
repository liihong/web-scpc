const Base = require('../base.js');
const util = require('../../../utils/util')
let userModel = 'cms_user'
const https = require('https')
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
                //如果不是微信端登录则不更新wxcode和头像
                if(wxcode !='' && wxavatar !=''){
                    let openId = await this.getOpenId(wxcode)
               
                    if (data.wxcode === null || data.wxcode == '') {
                        updateObj.wxcode = openId
                        updateObj.photo = wxavatar
                    } else {
                        if (data.wxcode != openId) {
                            return this.fail(2000, '该微信与登录用户绑定信息不一致', {})
                        }
                    }
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
                return this.fail(1000, '用户名或密码错误', '用户名或密码错误')
            }
        } catch (ex) {
            return this.fail(1000,'用户名或密码错误','用户名或密码错误')
        }
    }

    //获取某个人任务统计信息
    async getTaskStatAction() {
        let userToken = this.header('token')
        let data = {
            hour: {}
        }
        let daySql = `select sum(jggl.jgjs*(gygc.edgs/gygc.kjgjs)) sum from scglxt_t_jggl jggl,scglxt_t_gygc gygc WHERE ( jggl.gygcid=gygc.id and  jgryid ='` + userToken + `' and to_days(jgjssj) = to_days(now()) )`
        let day = await this.model().query(daySql)
        data.hour.day = day[0].sum == null ? 0 : day[0].sum
        let weekSql = `select sum(jggl.jgjs*(gygc.edgs/gygc.kjgjs)) sum from scglxt_t_jggl jggl,scglxt_t_gygc gygc WHERE ( jggl.gygcid=gygc.id and  jgryid ='` + userToken + `' and DATE_SUB(CURDATE(), INTERVAL 7 DAY) <= date(jgjssj) )`

        let week = await this.model().query(weekSql)
        data.hour.week = week[0].sum == null ? 0 : week[0].sum
        let monthSql = `select sum(jggl.jgjs*(gygc.edgs/gygc.kjgjs)) sum from scglxt_t_jggl jggl,scglxt_t_gygc gygc WHERE ( jggl.gygcid=gygc.id and  jgryid ='` + userToken + `' and DATE_FORMAT( jgjssj, '%Y%m' ) = DATE_FORMAT( CURDATE( ) , '%Y%m' ) )`

        let month = await this.model().query(monthSql)
        data.hour.month = month[0].sum == null ? 0 : month[0].sum
        return this.success(data)
    }

    getOpenId(wxcode) {
        return new Promise(async resolve => {
            let openId = ''
            https.get('https://api.weixin.qq.com/sns/jscode2session?appid=wx38b7bb893d50112b&secret=aa6ab4c9b0bb9e90dbddbdd921508458&js_code=' + wxcode + '&grant_type=authorization_code', (resp) => {
                let data = '';
                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    data = JSON.parse(data);
                    console.log(data)
                    openId = data.openid
                    resolve(openId)
                });

            }).on("error", (err) => {
                console.log("Error: " + err.message);
            });
        })
    }
};