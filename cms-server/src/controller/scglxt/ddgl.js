/**
 * 加工工艺操作的接口
 */
const Base = require('../base.js');
let ddModel = 'scglxt_t_dd'
import util from '../../../utils/util'
import exportXls from '../../../utils/exportXls'
import config from '../../config/config.js';
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx-style');
const _ = require('lodash');
const rename = think.promisify(fs.rename, fs);

module.exports = class extends Base {

    //根据订单表数据，生成新的订单编号
    async getNewDDbhAction() {
        let count = await this.model('scglxt_t_dd').query(`SELECT SUBSTRING_INDEX(xmname,'-',-1) AS count FROM scglxt_t_dd order by sjcjsj desc limit 1`)

        count = '00000' + (parseInt(count[0].count) + 1);
        count = count.substring(3, count.length);

        return this.success(count)
    }
    /**
     * 获取订单图纸信息并回填
     */
    async getDdTzAction() {
        try {
            let ssdd = this.get('ssdd')

            let data = await this.model('scglxt_t_dd_tz').where({
                ssdd: ssdd
            }).select();

            return this.success(data)
        } catch (ex) {
            return this.fail(ex)
        }
    }
    // 拷贝该订单并拷贝该订单下的所有工艺
    async copyDdAction() {
        let id = this.post('id')

        let newId = util.getUUId()
        let data = await this.model(ddModel).where({
            id: id
        }).find()
        data.id = newId
        data.xmname = data.xmname + '_copy'
        data.ckdate = null
        data.ckzt = null
        delete data.sjcjsj
        
        let addData = await this.model(ddModel).add(data)

        let bomList = await this.model('scglxt_t_bom').where({
            ssdd: id
        }).select()
        let gygcList = await this.model('scglxt_t_gygc').where({ssdd: id}).select()
        
        if (bomList.length > 0) {
            bomList.map(item => {
                var newBOMId = util.getUUId()
                gygcList.map(el=>{
                    if(item.id == el.bomid){
                        el.id = util.getUUId()
                        el.kjgjs = 0
                        el.yjgjs = 0
                        el.sjjs = 0
                        el.bfjs = 0
                        el.ssdd = newId
                        el.bomid = newBOMId
                        return el
                    }
                })
                item.id = newBOMId
                item.clzt = 0
                item.zddmc = item.zddmc + '_copy'
                item.zddzt = '0501'
                item.sjcjsj = util.getNowTime()
                item.blkssj = null
                item.bljssj = null
                item.cksj = null
                item.rksj = null
                item.ssdd = newId
                return item
            })
        }
        await this.model('scglxt_t_bom').addMany(bomList, {
            pk: 'ID'
        });
        await this.model('scglxt_t_gygc').addMany(gygcList, {
            pk: 'ID'
        });
        return this.success(addData)
    }


    //订单删除数据
    async deleteDdAction() {
        let where = this.post()
        let data = await this.model(ddModel).field('id').where(where).select()
        let ddId = ''
        if (data.length > 0) {
            data.map(item => {
                ddId += item['id'] + ','
            })
        }
        ddId = ddId.substring(0,ddId.length-1)
        let deleteJggl = await this.model('scglxt_t_jggl').where(
            `gygcid in (select id from scglxt_t_gygc where ssdd in (`+ddId+`))`
        ).delete()
        let deleteGygc = await this.model('scglxt_t_gygc').where({
            ssdd: ['in', ddId]
        }).delete()

        let deleteBom = await this.model('scglxt_t_bom').where({
            ssdd: ['in', ddId]
        }).delete()
        let deleteDd = await this.model(ddModel).where(where).delete()

        return this.success(deleteDd)
    }

    // 根据不同条件查询订单数据
    async getDdListByWhereAction() {
        let where = this.post('where')
        let pageSize = this.post('pageSize')
        let pageNumber = this.post('pageNumber')
        // let sql = `select ID,XMNAME,DDLEVEL,(SELECT NAME FROM (SELECT id,mc NAME FROM scglxt_tyzd WHERE xh LIKE '04__') tras WHERE tras.id=DDLEVEL) DDLEVEL_TEXT,STARTTIME,ENDTIME from scglxt_t_dd where 1=1 and (` + where + `) ORDER BY DDLEVEL,SJCJSJ`
        let data = await this.model(ddModel).field("ID,XMNAME,DDLEVEL,(SELECT NAME FROM (SELECT id,mc NAME FROM scglxt_tyzd WHERE xh LIKE '04__') tras WHERE tras.id=DDLEVEL) DDLEVEL_TEXT,STARTTIME,ENDTIME").where(where).order('DDLEVEL,SJCJSJ').page(pageNumber, pageSize).countSelect()
        // let data = await this.model().query(sql)
        return this.success(data)
    }
    //导出BOM
    async exportDdBOMAction() {
        let ddid = this.get('id')
        const res = this.ctx.res;
        let ddsql = `select ht.htbh,dd.xmname,zd.mc ddlevel, starttime,endtime from scglxt_t_dd dd,scglxt_t_ht ht,scglxt_tyzd zd where dd.ssht=ht.id and zd.xh = dd.ddlevel and dd.id = '` + ddid + `'`
        let infos = await this.model().query(ddsql)

        let sql = `SELECT
        ( @i := @i + 1 ) AS rownum,
            zddmc,
            t2.clmc,
            concat_ws('    ',cldx,concat(bljs,'件')) cldx,
            jgsl,
            gxnr,
            bmcl,
            '' bz,
            '' endtime
            FROM
        (select @i := 0) b,
        scglxt_t_bom bom
        LEFT JOIN scglxt_t_cl t2 ON bom.zddcz = t2.id 
    WHERE
        ssdd = '` + ddid + `' order by sjcjsj
        `
        let datas = await this.model().query(sql)

        let _data = datas.map((item, i) => {
            item.jhrq = ''
            item.yjdhrq = ''
            item.sjdhrq = ''
            item.bz = ''
            return item
        })
        exportXls.exportBOMXls(infos[0], datas, res)
    }
    //导出组件
    async exportDdByZjAction() {
        let ddid = this.get('id')
        const res = this.ctx.res;
        let ddsql = `select ht.htbh,dd.xmname,zd.mc ddlevel, starttime,endtime from scglxt_t_dd dd,scglxt_t_ht ht,scglxt_tyzd zd where dd.ssht=ht.id and zd.xh = dd.ddlevel and dd.id = '` + ddid + `'`
        let infos = await this.model().query(ddsql)

        let sql = `select (@i := @i + 1) as xh,id zjid,zjmc ljmc,'' ljcz,'' ljgg,zjkc jgsl,'' ljlx, '' sccj,'0' lx from scglxt_t_zj,(select @i := 0) b where ssdd = '` + ddid + `' union all

        select '' xh,zjid,bom.zddmc ljmc, cl.clmc ljcz,concat_ws('    ',cldx,concat(bljs,'件'))  ljgg,jgsl ljsl,'机加工' ljlx,'' sccj,'1' lx from scglxt_t_bom bom,scglxt_t_bom_zj bomzj,scglxt_t_zj zj,scglxt_t_cl cl,( SELECT @i := 0 ) b 
        where bom.zddcz=cl.id and bom.id = bomzj.bomid and bomzj.zjid=zj.id and zj.ssdd='` + ddid + `'
        union all
        select '' xh,zjid,ljmc,ljcz,ljgg,(bzjzj.bzjsl*zj.zjkc) ljsl, ljlx,sccj,'2' lx from scglxt_t_bzj bzj,scglxt_t_bzj_zj bzjzj,scglxt_t_zj zj,( SELECT @i := 0 ) b 
        where bzj.id = bzjzj.bzjid and bzjzj.zjid=zj.id and zj.ssdd='` + ddid + `'  order by zjid,lx,ljlx,xh desc
        `
        let datas = await this.model().query(sql)

        let _data = datas.map((item, i) => {
            item.jhrq = ''
            item.yjdhrq = ''
            item.sjdhrq = ''
            item.bz = ''
            return item
        })
        exportXls.exportXls(infos[0], datas, res)
    }

    // 上传订单图纸
    async uploadDrawingAction() {
        // let themefile = this.file('file');
        let ssdd = this.post('ssdd');
        // let filepath = themefile.path; //为防止上传的时候因文件名重复而覆盖同名已上传文件，path是MD5方式产生的随机名称
        // let uploadpath = think.ROOT_PATH + '/../public/upload/' + ssdd + '/';
        // let uploadpath = '/upload/';

        if (!think.isEmpty(this.file('file'))) {
            //进行压缩等处理
            let file = think.extend({}, this.file('file'));

            //保存文件的路径
            let savepath = think.ROOT_PATH + '/../upload/ddtz/' + ssdd + '/';
            // let savepath = think.ROOT_PATH + '/../public/upload/' + ssdd + '/';
            think.mkdir(savepath);//创建该目录
            let filepath = file.path; //文件路径
            let filename = file.name; //文件名
            let suffix = filename.substr(filename.lastIndexOf('.') + 1); //文件后缀
            // let newfilename = Math.random().toString(36).substr(2) + '.' + suffix;

            //读文件
            let datas = fs.readFileSync(filepath);
            //写文件
            fs.writeFileSync(savepath + filename, datas);
            let newpath = savepath + filename;
            file.path = newpath
            
            let tzData = {
                id: util.getUUId(),
                ssdd: ssdd,
                tzlx:suffix,
                tzmc: filename,
                tzdz: file.path,
                url: 'upload/ddtz/'+ ssdd+'/' + filename
            }
            let data = this.model('scglxt_t_dd_tz').add(tzData)
            return this.success(file)
        }
    }

    //删除上传图纸信息
    async deleteDdTzAction() {
        let ssdd = this.post('ssdd')
        let id = this.post('id')

        let data = this.model('scglxt_t_dd_tz').where({id: id}).delete()

        return this.success(data)
    }
};