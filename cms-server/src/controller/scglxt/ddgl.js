/**
 * 加工工艺操作的接口
 */
import util from '../../../utils/util';
import exportXls from '../../../utils/exportXls';
const Base = require('../base.js');
const ddModel = 'scglxt_t_dd';
const fs = require('fs');

module.exports = class extends Base {
  async getOrderListAction() {
    const {pageSize, pageNumber} = this.get();

    const data = await this.model('scglxt_t_dd').join({
      table: 'scglxt_t_ht',
      as: 'ht',
      join: 'left',
      on: ['ssht', 'id']
    }).field('t.id,xmname,ssht,fun_yjggs ( t.id ) dqjd,zgs,ht.htbh,ht.remark').alias('t').page(pageNumber, pageSize).where({
      ckzt: null,
      isshow: 1
    }).countSelect();

    return this.success(data);
  }

  // 根据订单ID获取客户信息
  async getDDKhxxByIdAction() {
    const ssdd = this.get('ssdd');
    const sql = ` select * from scglxt_t_kh where id in (
            select khid from scglxt_t_ht where id in (select ssht from scglxt_t_dd where id='` + ssdd + `'))`;
    const data = await this.model().query(sql);

    return this.success(data[0]);
  }
  // 根据ID获取某一订单详情
  async getDdDetailAction() {
    const id = this.get('id');

    const data = await this.model('scglxt_t_dd').join({
      table: 'scglxt_t_ht',
      as: 'ht',
      join: 'left',
      on: ['ssht', 'id']
    }).join({
      table: 'scglxt_t_kh',
      as: 'kh',
      join: 'left',
      on: ['ht.khid', 'id']
    }).alias('t').field('t.id,kh.mc khmc,ht.htbh,ht.jkje,t.xmname,t.starttime,t.endtime,ht.ywlx,ht.htje,fun_yjggs ( t.id ) dqjd,t.zgs,ht.bjdzj,ht.remark').where({
      't.id': id
    }).find();

    const ddtj = await this.model('scglxt_t_gygc').join({
      table: 'scglxt_t_jggy',
      as: 'gy',
      join: 'left',
      on: ['gynr', 'id']
    }).alias('t').field('t.ssdd,t.gynr,gy.gymc,sum(bzgs) zgs').where({
      't.ssdd': id
    }).group('gynr').select();
    data.gstj = ddtj;
    return this.success(data);
  }
  // 获取进行中的订单
  async getWorkingDDListAction() {
    const pageSize = this.post('pageSize');
    const pageNumber = this.post('pageNumber');
    const queryKey = this.post('queryKey');
    const whereObj = {};
    if (queryKey && queryKey != '') {
      whereObj.XMNAME = ['like', '%' + queryKey + '%'];
    }
    const data = await this.model(ddModel).field("ID,XMNAME,DDLEVEL,(SELECT NAME FROM (SELECT id,mc NAME FROM scglxt_tyzd WHERE xh LIKE '04__') tras WHERE tras.id=DDLEVEL) DDLEVEL_TEXT,STARTTIME,ENDTIME").where('id in (select DISTINCT ssdd from scglxt_t_bom where zddzt=\'0502\')').where(whereObj).page(pageNumber, pageSize).countSelect();

    return this.success(data);
  }
  // 根据订单表数据，生成新的订单编号
  async getNewDDbhAction() {
    let count = await this.model('scglxt_t_dd').query(`SELECT SUBSTRING_INDEX(xmname,'-',-1) AS count FROM scglxt_t_dd   where xmname like '2020%' order by sjcjsj desc limit 1`);

    if (count.length > 0) {
      count = '00000' + (parseInt(count[0].count) + 1);
      count = count.substring(3, count.length);
    } else {
      count = '00001';
    }

    return this.success(count);
  }
  /**
     * 获取订单图纸信息并回填
     */
  async getDdTzAction() {
    try {
      const ssdd = this.get('ssdd');

      const data = await this.model('scglxt_t_dd_tz').where({
        ssdd: ssdd
      }).select();

      return this.success(data);
    } catch (ex) {
      return this.fail(ex);
    }
  }
  // 拷贝该订单并拷贝该订单下的所有工艺
  async copyDdAction() {
    const id = this.post('primaryKey').value;
    const newId = util.getUUId();

    const data = this.post('form');
    data.id = newId;
    data.ckdate = null;
    data.ckzt = null;
    const addData = await this.model(ddModel).add(data);

    const bomList = await this.model('scglxt_t_bom').where({
      ssdd: id
    }).order('id').select();
    const gygcList = await this.model('scglxt_t_gygc').where({
      ssdd: id
    }).order('id').select();

    if (bomList.length > 0) {
      bomList.map(item => {
        var newBOMId = util.getUUId();
        gygcList.map((el, i) => {
          if (item.id === el.bomid) {
            el.id = util.getUUId();
            el.kjgjs = 0;
            el.yjgjs = 0;
            el.sjjs = 0;
            el.bfjs = 0;
            el.serial = i;
            el.status = null;
            el.sfjy = null;
            el.kssj = null;
            el.jssj = null;
            el.ssdd = newId;
            el.czryid = null;
            el.jyryid = null;
            el.bomid = newBOMId;
            return el;
          }
        });
        item.id = newBOMId;
        item.clzt = 0;
        item.zddmc = item.zddmc;
        item.zddzt = '0501';
        item.endtime = data.endtime;
        item.sjcjsj = util.getNowTime();
        item.blkssj = null;
        item.bljssj = null;
        item.cksj = null;
        item.rksj = null;
        item.ssdd = newId;
        return item;
      });
    }
    await this.model('scglxt_t_bom').addMany(bomList, {
      pk: 'ID'
    });
    await this.model('scglxt_t_gygc').addMany(gygcList, {
      pk: 'ID'
    });

    const dataLog = {
      id: util.getUUId(),
      operater_id: this.header('token'),
      operate_type: 'copy',
      tablename: 'SCGLXT_T_DD',
      content: '订单管理',
      old_value: JSON.stringify(data)
    };

    await this.model('resource_log').add(dataLog);

    return this.success(addData);
  }

  // 订单删除数据
  async deleteDdAction() {
    const where = this.post();
    const data = await this.model(ddModel).field('id').where(where).select();
    let ddId = '';
    if (data.length > 0) {
      data.map(item => {
        ddId += item['id'] + ',';
      });
    }
    ddId = ddId.substring(0, ddId.length - 1);
    if (ddId !== '') {
      await this.model('scglxt_t_jggl').where(
        `gygcid in (select id from scglxt_t_gygc where ssdd in (` + ddId + `))`
      ).delete();
      await this.model('scglxt_t_gygc').where({
        ssdd: ['in', ddId]
      }).delete();
      await this.model('scglxt_t_dd_tz').where({
        ssdd: ['in', ddId]
      }).delete();
      await this.model('scglxt_t_bom').where({
        ssdd: ['in', ddId]
      }).delete();
    }

    const oldData = await this.model(ddModel).where(where).find();
    const deleteDd = await this.model(ddModel).where(where).delete();

    const dataLog = {
      id: util.getUUId(),
      operater_id: this.header('token'),
      operate_type: 'delete',
      tablename: 'SCGLXT_T_DD',
      content: '订单管理',
      old_value: JSON.stringify(oldData)
    };

    await this.model('resource_log').add(dataLog);

    return this.success(deleteDd);
  }

  // 根据不同条件查询订单数据
  async getDdListByWhereAction() {
    const where = this.post('where') === undefined ? {} : this.post('where');
    const pageSize = this.post('pageSize');
    const pageNumber = this.post('pageNumber');
    // let sql = `select ID,XMNAME,DDLEVEL,(SELECT NAME FROM (SELECT id,mc NAME FROM scglxt_tyzd WHERE xh LIKE '04__') tras WHERE tras.id=DDLEVEL) DDLEVEL_TEXT,STARTTIME,ENDTIME from scglxt_t_dd where 1=1 and (` + where + `) ORDER BY DDLEVEL,SJCJSJ`
    const data = await this.model(ddModel).field("ID,XMNAME,DDLEVEL,(SELECT NAME FROM (SELECT id,mc NAME FROM scglxt_tyzd WHERE xh LIKE '04__') tras WHERE tras.id=DDLEVEL) DDLEVEL_TEXT,STARTTIME,ENDTIME").where(where).order('DDLEVEL,SJCJSJ DESC').page(pageNumber, pageSize).countSelect();
    // let data = await this.model().query(sql)
    return this.success(data);
  }

  // 获取订单的BOM数据
  async getDdBOMDataAction() {
    const ddid = this.get('id');
    const ddsql = `select ht.htbh,dd.xmname,zd.mc ddlevel, starttime,endtime from scglxt_t_dd dd,scglxt_t_ht ht,scglxt_tyzd zd where dd.ssht=ht.id and zd.xh = dd.ddlevel and dd.id = '` + ddid + `'`;
    const infos = await this.model().query(ddsql);
    const _this = this;
    const sql = `SELECT  (@rownum := @rownum + 1) AS rownum, bom.id, zddmc,  t2.clmc, cldx, jgsl, gxnr, bmcl, '' AS bz, '' endtime 
        FROM (select @rownum := 0) t,scglxt_t_bom bom  LEFT JOIN scglxt_t_cl t2   ON bom.zddcz = t2.id  WHERE ssdd = '` + ddid + `' order by bom.sjcjsj
        `;

    const tjSql = "SELECT gymc,ROUND( SUM( bzgs )/ 60,2 ) zgs FROM scglxt_t_gygc gc,`scglxt_t_jggy` gy WHERE gc.`gynr`=gy.id AND bomid IN (SELECT id FROM scglxt_t_bom WHERE ssdd='" + ddid + "') GROUP BY gymc";

    const tjInfo = {
      info: '工时合计：',
      zgs: 0
    };

    const datas = await this.model().query(sql);
    const tjData = await this.model().query(tjSql);
    tjData.forEach(item => {
      tjInfo.info += item.gymc + '(' + item.zgs + ')' + '-';
      tjInfo.zgs += parseFloat(item.zgs);
    });
    tjInfo.info = tjInfo.info.substring(0, tjInfo.info.length - 1);
    tjInfo.zgs = '合计：' + tjInfo.zgs.toFixed(2).toString();
    const pArr = [];
    datas.map(async item => {
      pArr.push(_this.getGygxData(item, item.id));
    });
    await Promise.all(pArr);

    const data = {
      ddInfo: infos,
      bomInfo: datas,
      tjInfo: tjInfo
    };

    return this.success(data);
  }
  // 批量更新BOM出库状态
  getGygxData(item, bomid) {
    const blsql = `SELECT '1' AS rownum,'备料' AS sbmc,CONCAT(bom.cldx,' ',bom.bljs,' ',cl.clmc ) gynr,NULL AS t,NULL AS edgs,'' as zbgs,NULL AS zgs,NULL AS jhwcsj,NULL AS sjwcsj, NULL AS czr,
        NULL AS jyr FROM scglxt_t_bom bom,scglxt_t_cl cl WHERE bom.zddcz=cl.id AND  bom.id ='${bomid}'
union all
SELECT (@rownum:=@rownum+1) AS rownum,gy.gymc sbmc,gc.ZYSX gynr,null as t,edgs,gc.bzgs zgs,gc.zbgs,NULL AS jhwcsj,NULL AS sjwcsj,
        '' AS czr,'' as jyr FROM scglxt_t_sblx sb right JOIN scglxt_t_gygc gc ON sb.id=gc.sbid LEFT JOIN scglxt_t_jggy gy ON gc.gynr = gy.id where  bomid='${bomid}'`;
    return new Promise(async resolve => {
      const wjData = await this.model().query(blsql);
      item.gygxList = wjData;
      resolve();
    });
  }
  // 导出BOM
  async exportDdBOMAction() {
    const ddid = this.get('id');
    const res = this.ctx.res;
    const ddsql = `select ht.htbh,dd.xmname,zd.mc ddlevel, starttime,endtime from scglxt_t_dd dd,scglxt_t_ht ht,scglxt_tyzd zd where dd.ssht=ht.id and zd.xh = dd.ddlevel and dd.id = '` + ddid + `'`;
    const infos = await this.model().query(ddsql);

    const sql = `SELECT  (@rownum := @rownum + 1) AS rownum, bom.id, zddmc,  t2.clmc, cldx, jgsl, gxnr, bmcl, '' AS bz, '' endtime 
        FROM (select @rownum := 0) t,scglxt_t_bom bom  LEFT JOIN scglxt_t_cl t2   ON bom.zddcz = t2.id  WHERE ssdd = '` + ddid + `' order by bom.sjcjsj
        `;

    const tjSql = "SELECT gymc,ROUND( SUM( bzgs )/ 60,2 ) zgs FROM scglxt_t_gygc gc,`scglxt_t_jggy` gy WHERE gc.`gynr`=gy.id AND bomid IN (SELECT id FROM scglxt_t_bom WHERE ssdd='" + ddid + "') GROUP BY gymc";

    const tjInfo = {
      info: '工时合计：',
      zgs: 0
    };

    const datas = await this.model().query(sql);
    const tjData = await this.model().query(tjSql);
    tjData.forEach(item => {
      tjInfo.info += item.gymc + '(' + item.zgs + ')' + '-';
      tjInfo.zgs += parseFloat(item.zgs);
    });
    tjInfo.info = tjInfo.info.substring(0, tjInfo.info.length - 1);
    tjInfo.zgs = '合计：' + tjInfo.zgs.toFixed(2).toString();
    exportXls.exportBOMXls(infos[0], datas, tjInfo, res);
  }
  // 导出组件
  async exportDdByZjAction() {
    const ddid = this.get('id');
    const res = this.ctx.res;
    const type = this.get('type');
    const ddsql = `select ht.htbh,dd.xmname,zd.mc ddlevel, starttime,endtime from scglxt_t_dd dd,scglxt_t_ht ht,scglxt_tyzd zd where dd.ssht=ht.id and zd.xh = dd.ddlevel and dd.id = '` + ddid + `'`;
    const infos = await this.model().query(ddsql);

    const sql = `select (@i := @i + 1) as xh,id zjid,zjmc ljmc,'' ljcz,'' ljgg,zjkc jgsl,'' ljlx, '' sccj,'0' lx,TRUNCATE(zjdj,2) dj,TRUNCATE(zjdj*zjkc,2) as zje from scglxt_t_zj,(select @i := 0) b where ssdd = '` + ddid + `' union all

        select '' xh,zjid,bom.zddmc ljmc, cl.clmc ljcz,concat_ws('    ',cldx,concat(bljs,'件'))  ljgg,( bomzj.zjsl * zj.zjkc ) ljsl,'机加工' ljlx,'' sccj,'1' lx,TRUNCATE(clje,2) dj,TRUNCATE ( clje*jgsl, 2 ) AS zje  from scglxt_t_bom bom,scglxt_t_bom_zj bomzj,scglxt_t_zj zj,scglxt_t_cl cl,( SELECT @i := 0 ) b 
        where bom.zddcz=cl.id and bom.id = bomzj.bomid and bomzj.zjid=zj.id and zj.ssdd='` + ddid + `'
        union all
        select '' xh,zjid,ljmc,ljcz,ljgg,(bzjzj.bzjsl*zj.zjkc) ljsl, ljlx,sccj,'2' lx,ljdj dj,truncate((bzjzj.bzjsl * zj.zjkc )*ljdj,2) as  zje from scglxt_t_bzj bzj,scglxt_t_bzj_zj bzjzj,scglxt_t_zj zj,( SELECT @i := 0 ) b 
        where bzj.id = bzjzj.bzjid and bzjzj.zjid=zj.id and zj.ssdd='` + ddid + `'  order by zjid,lx,ljlx,xh desc
        `;
    const datas = await this.model().query(sql);
    const tjData = {
      jjg: 0,
      wg: 0,
      bzj: 0
    };
    const _data = datas.map((item, i) => {
      item.jhrq = '';
      item.yjdhrq = '';
      item.sjdhrq = '';
      item.bz = '';
      if (item.ljlx === '机加工') {
        tjData.jjg += parseFloat(item.zje);
      } else if (item.ljlx === '外购') {
        tjData.wg += parseFloat(item.zje);
      } else if (item.ljlx === '标准件') {
        tjData.bzj += parseFloat(item.zje);
      }
      return item;
    });

    tjData.zgs = '机加工合计：' + tjData.jjg.toFixed(2).toString() + '    ';
    tjData.zgs += '外购合计：' + tjData.wg.toFixed(2).toString() + '    ';
    tjData.zgs += '标准件合计：' + tjData.bzj.toFixed(2).toString();
    exportXls.exportXls(infos[0], _data, res, type, tjData);
  }

  // 根据时间范围，导出对应的工人工时统计数据
  async exportGRGSTJAction() {
  }

  // 导出订单备料
  async exportDdBLAction() {
    const ddid = this.get('id');
    const res = this.ctx.res;

    const ddsql = `select ht.htbh,dd.xmname,zd.mc ddlevel, starttime,endtime from scglxt_t_dd dd,scglxt_t_ht ht,scglxt_tyzd zd where dd.ssht=ht.id and zd.xh = dd.ddlevel and dd.id = '` + ddid + `'`;
    const infos = await this.model().query(ddsql);

    const sql = `SELECT  (@rownum := @rownum + 1) AS rownum, bom.id, zddmc,  t2.clmc, cldx, bljs,jgsl,ROUND(IFNULL(clzl*(1+sh),0),2) clzl,IFNULL(cldj,0) cldj, ROUND(IFNULL(clje, 0),2) clje 
        FROM (select @rownum := 0) t,scglxt_t_bom bom  LEFT JOIN scglxt_t_cl t2   ON bom.zddcz = t2.id  WHERE ssdd = '` + ddid + `' order by sjcjsj`;

    const tjInfo = {
      info: '合计：',
      zgs: 0
    };

    const datas = await this.model().query(sql);
    datas.forEach(item => {
      tjInfo.zgs += parseFloat(item.clje);
    });
    tjInfo.info = tjInfo.info.substring(0, tjInfo.info.length - 1);
    tjInfo.zgs = tjInfo.zgs.toFixed(2).toString();
    exportXls.exportDdBlXls(infos[0], datas, tjInfo, res);
  }
  // 上传订单图纸
  async uploadDrawingAction() {
    const ssdd = this.post('ssdd');

    if (!think.isEmpty(this.file('file'))) {
      // 进行压缩等处理
      const file = think.extend({}, this.file('file'));

      // 保存文件的路径
      const savepath = think.ROOT_PATH + '/../upload/ddtz/' + ssdd + '/';
      // let savepath = think.ROOT_PATH + '/../public/upload/' + ssdd + '/';
      think.mkdir(savepath); // 创建该目录
      const filepath = file.path; // 文件路径
      const filename = file.name; // 文件名
      const suffix = filename.substr(filename.lastIndexOf('.') + 1); // 文件后缀

      // 读文件
      const datas = fs.readFileSync(filepath);
      // 写文件
      fs.writeFileSync(savepath + filename, datas);
      const newpath = savepath + filename;
      file.path = newpath;

      const tzData = {
        id: util.getUUId(),
        ssdd: ssdd,
        tzlx: suffix,
        tzmc: filename,
        tzdz: file.path,
        url: 'upload/ddtz/' + ssdd + '/' + filename
      };
      const data = await this.model('scglxt_t_dd_tz').add(tzData);
      return this.success(data);
    }
  }

  // 删除上传图纸信息
  async deleteDdTzAction() {
    const id = this.post('id');

    const data = await this.model('scglxt_t_dd_tz').where({
      id: id
    }).delete();

    return this.success(data);
  }

  // 修改订单结束时间
  async updateEndTimeAction() {
    const id = this.post('ddid');
    const endTime = this.post('endTime');
    const data = await this.model('scglxt_t_dd').where({
      id: id
    }).update({
      endtime: endTime
    });

    await this.model('scglxt_t_bom').where({
      ssdd: id
    }).update({
      endtime: endTime
    });

    const log = {
      id: util.getUUId(),
      type: '修改订单结束时间',
      error: '',
      infos: this.post(),
      operater: this.header('token')
    };

    await this.model('operate_log').add(log);
    return this.success(data);
  }

  // 获取订单标注
  async getDdMarkAction() {
    const id = this.post('id');
    const data = await this.model(ddModel).field('mark').where({
      id: id
    }).find();
    return this.success(data);
  }
  // 设置订单标注
  async setDdMarkAction() {
    const id = this.post('id');
    const mark = this.post('mark');

    const data = await this.model(ddModel).where({
      id: id
    }).update({
      mark: mark
    });

    return this.success(data);
  }

  // 更新所有订单的零件可以开始备料了
  async updateAllDdBLZTAction() {
    const id = this.post('ssdd');

    const data = await this.model('scglxt_t_bom').where({
      ssdd: id,
      clzt: null
    }).update({
      clzt: 3,
      blkssj: util.getNowTime()
    });

    return this.success(data);
  }

  // 定制看板的订单信息
  async setDDWorkDataAction() {
    const ids = this.post('ids');

    await this.model('scglxt_t_dd').where('1=1').update({
      isshow: 0
    });

    const data = await this.model('scglxt_t_dd').where({id: ['in', ids]}).update({
      isshow: 1
    });

    return this.success(data);
  }

  // 获取定制的订单数据
  async getCustomDDWorkDataAction() {
    const isshow = this.get('isshow') === undefined ? 1 : this.get('isshow');
    const data = await this.model(ddModel).join('scglxt_t_ht ON dd.ssht=scglxt_t_ht.id').alias('dd').field('dd.id,dd.xmname,scglxt_t_ht.remark mark,dd.endtime').where({isshow: isshow, ckzt: null}).order('ddorder+1 asc').select();

    return this.success(data);
  }

  // 订单排序
  async setDdOrderDataAction() {
    const form = this.post('form');
    const data = await this.model(ddModel).updateMany(form);

    return this.success(data);
  }
};
