/**
 * 组件操作的接口
 */
const Base = require('../base.js');
let zjModel = 'scglxt_t_zj'
import util from '../../../utils/util'
module.exports = class extends Base {

    /**
     * 添加组件，添加组件的同时，让组件和标准件的关系也保存起来，方便回填
     */
    async addZjAction() {
        try {
            const vm = this
            let form = this.post('form')
            let bzj = this.post('bzj')
            let jgj = this.post('jgj')

            let data = await this.model(zjModel).add(form);
            if (bzj.length > 0) {
                // let ckLog = []
                // let ckslUpdate =[]
                // bzj.map(item=>{
                //     let log = {
                //         id:util.getUUId(),
                //         ljmc:item.bzjmc,
                //         ljsl:item.bzjsl,
                //         type:'out',
                //         rjr:vm.header('token')
                //     }
                //     ckLog.push(log)
                //     let cksl={
                //         id:item.bzjid,
                //         dqkc:'(select dqkc from scglxt_t_bzj where id='+item.bzjid+')-'+item.bzjsl
                //     }
                //     ckslUpdate.push(cksl)
                // })
                
                let bzjData = await this.model('scglxt_t_bzj_zj').addMany(bzj, {
                    pk: 'ID'
                });
            }
            if (jgj.length > 0) {
                let jgjData = await this.model('scglxt_t_bom_zj').addMany(jgj, {
                    pk: 'ID'
                });
            }

            return this.success(data)
        } catch (ex) {
            return this.fail(ex)
        }
    }
    //编辑组件，先删除标准件关系，再重新根据参数添加
    async editZjAction() {
        try {
            let form = this.post('form')
            let bzj = this.post('bzj')
            let jgj = this.post('jgj')
            let primaryKey = this.post('primaryKey')

            let deleteRow = await this.model('scglxt_t_bzj_zj').where({
                zjid: primaryKey.id
            }).delete()
            let deleteRow2 = await this.model('scglxt_t_bom_zj').where({
                zjid: primaryKey.id
            }).delete()

            if(bzj.length > 0) {
                let bzjData = await this.model('scglxt_t_bzj_zj').addMany(bzj, {
                    pk: 'ID'
                });
            }
           
            if(jgj.length >0) {
                let jgjData = await this.model('scglxt_t_bom_zj').addMany(jgj, {
                    pk: 'ID'
                });
            }
            let data = await this.model(zjModel).where(primaryKey).update(form)

            return this.success(data)
        } catch (ex) {
            return this.fail(ex)
        }
    }

    async getBzjByZjIdAction() {
        try {
            let Id = this.get('id')
            let zjData = await this.model(zjModel).where({
                id: Id
            }).find()
            let data = await this.model('scglxt_t_bzj_zj').where({
                zjid: Id
            }).field('id,zjmc,zjid,bzjmc,bzjid,bzjsl,bz').select()
            let jgjData = await this.model('scglxt_t_bom_zj').where({
                zjid: Id
            }).field('id,zjmc,zjid,zjsl,bomid').select()
            zjData.bzj = data
            zjData.jgj = jgjData

            return this.success(zjData)
        } catch (ex) {
            return this.fail(ex)
        }
    }

    //通过组件ID删除相应数据
    async deleteZjByIdAction() {
        let Id = this.post('id')

        let bom = await this.model('scglxt_t_bom_zj').where({
            zjid: Id
        }).delete()
        let bzj = await this.model('scglxt_t_bzj_zj').where({
            zjid: Id
        }).delete()

        let data = await this.model(zjModel).where({
            id: Id
        }).delete()

        return this.success(data)
    }

    //复制组件
    async copyZjByIdAction() {
        let zj = this.post('form')
        zj.id = util.getUUId()
        zj.sjcjsj = util.getNowTime()

        let bomData = this.post('jgj')
        bomData.map(item => {
            item.id = util.getUUId()
            item.zjid = zj.id
            return item
        })

        let bzjData = this.post('bzj')
        bzjData.map(item => {
            item.id = util.getUUId()
            item.zjid = zj.id
            item.sjcjsj = util.getNowTime()
            return item
        })

        let data = await this.model(zjModel).add(zj)

        await this.model('scglxt_t_bom_zj').addMany(bomData)
        await this.model('scglxt_t_bzj_zj').addMany(bzjData)
        return this.success(data)
    }
    //获取组件树型数据
    async getZJTreeListAction() {
        let pageNumber = this.get('pageNumber')
        let pageSize = this.get('pageSize')
        let queryKey = this.get('queryKey')
        let curPage = (pageNumber - 1) * pageSize
        let where = '1=1'
        if (queryKey && queryKey != '') {
            where = where + ` and  (XMNAME like '%` + queryKey + `%' or zjmc like '%` + queryKey + `%')`
        }
        let sql = `SELECT DISTINCT dd.ID,XMNAME,DDLEVEL,(SELECT NAME FROM (SELECT id,mc NAME FROM scglxt_tyzd WHERE xh LIKE '04__') tras WHERE tras.id=DDLEVEL) DDLEVEL_TEXT,STARTTIME,ENDTIME,dd.sjcjsj FROM scglxt_t_dd dd,scglxt_t_zj zj where (dd.id = zj.ssdd and `+where+`)  ORDER BY dd.sjcjsj desc limit ` + curPage + `,` + pageSize + `;`
        let countSql = `SELECT count(*) count  FROM ( SELECT DISTINCT dd.ID,XMNAME,DDLEVEL,(SELECT NAME FROM (SELECT id,mc NAME FROM scglxt_tyzd WHERE xh LIKE '04__') tras WHERE tras.id=DDLEVEL) DDLEVEL_TEXT,STARTTIME,ENDTIME,dd.sjcjsj FROM scglxt_t_dd dd,scglxt_t_zj zj where dd.id = zj.ssdd  and `+where+` ORDER BY dd.sjcjsj desc ) t `
        let data = await this.model().query(sql)
        let count = await this.model().query(countSql)
        let info = {
            count: count[0].count,
            currentPage: pageNumber,
            data: data,
            pageSize: pageSize,
            totalPages: (count[0].count + pageSize - 1) / pageSize
        }
        return this.success(info)
    }

    async getZJListBySSDdAction() {
        let ssdd = this.get('ssdd')
        let zjData = await this.model(zjModel).alias('zj').where({
            ssdd: ssdd
        }).field('zj.*,(SELECT NAME FROM (SELECT id,xmname NAME FROM scglxt_t_dd WHERE id="' + ssdd + '") tras WHERE tras.id=ssdd) ssdd_TEXT').select()

        return this.success(zjData)
    }
};