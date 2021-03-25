const Base = require('../base.js');
const util = require('../../../utils/util');
const userModel = 'cms_user';
module.exports = class extends Base {
  // 任务列表
  async getTaskListAction() {
    try {
      const pageNumber = this.get('pageNumber');
      const pageSize = this.get('pageSize');
      const token = this.header('token');
      const queryKey = this.get('queryKey');
      const curPage = (pageNumber - 1) * pageSize;
      let where = '1=1';

      if (queryKey && queryKey != '') {
        where = where + ` and  (bomid_text like '%` + queryKey + `%' or ssdd_text like '%` + queryKey + `%'  )`;
      }
      const sql = `SELECT * from (SELECT BFJS,BOMID,(SELECT NAME FROM (SELECT id,zddmc NAME FROM scglxt_t_bom) tras WHERE tras.id=BOMID) BOMID_TEXT,BZGS,CZRYID,(SELECT NAME FROM (SELECT id,rymc NAME FROM scglxt_t_ry) tras WHERE tras.id=CZRYID) CZRYID_TEXT,EDGS,FGCS,GYNR,(SELECT NAME FROM (SELECT id,gymc NAME FROM scglxt_t_jggy) tras WHERE tras.id=GYNR) GYNR_TEXT,ID,(SELECT jgsl FROM scglxt_t_bom bom WHERE id =t.bomid) JGSL,SBID,(SELECT NAME FROM (SELECT id,mc NAME FROM scglxt_t_sblx) tras WHERE tras.id=SBID) SBID_TEXT,SERIAL,SJJS,YJGJS,ZYSX,(KJGJS-YJGJS - SJJS) DJGJS,SSDD,(SELECT NAME FROM (SELECT id,xmname NAME FROM scglxt_t_dd) tras WHERE tras.id=SSDD) SSDD_TEXT,(SELECT ddtz FROM scglxt_t_bom bom WHERE id IN (SELECT bomid FROM scglxt_t_gygc gygc WHERE bom.id=gygc.bomid AND t.id=gygc.id)) DDTZ,(SELECT ddlevel FROM scglxt_t_dd dd WHERE id =t.ssdd) DDLEVEL,(SELECT endtime FROM scglxt_t_dd dd WHERE id =t.ssdd) ENDTIME  FROM
            scglxt_t_gygc t  where ( bfjs+yjgjs+sjjs <= kjgjs ) and (KJGJS-YJGJS-SJJS)!= 0 and czryid ='` + token + `'  ) t where (` + where + `)  order by DDLEVEL asc  limit ` + curPage + `,` + pageSize + `;`;

      const countSql = `SELECT count(*) count  FROM ( SELECT BFJS,BOMID,(SELECT NAME FROM (SELECT id,zddmc NAME FROM scglxt_t_bom) tras WHERE tras.id=BOMID) BOMID_TEXT,BZGS,CZRYID,(SELECT NAME FROM (SELECT id,rymc NAME FROM scglxt_t_ry) tras WHERE tras.id=CZRYID) CZRYID_TEXT,EDGS,FGCS,GYNR,(SELECT NAME FROM (SELECT id,gymc NAME FROM scglxt_t_jggy) tras WHERE tras.id=GYNR) GYNR_TEXT,ID,(SELECT jgsl FROM scglxt_t_bom bom WHERE id =t.bomid) JGSL,SBID,(SELECT NAME FROM (SELECT id,mc NAME FROM scglxt_t_sblx) tras WHERE tras.id=SBID) SBID_TEXT,SERIAL,SJJS,YJGJS,ZYSX,(KJGJS-YJGJS - SJJS) DJGJS,SSDD,(SELECT NAME FROM (SELECT id,xmname NAME FROM scglxt_t_dd) tras WHERE tras.id=SSDD) SSDD_TEXT,(SELECT ddtz FROM scglxt_t_bom bom WHERE id IN (SELECT bomid FROM scglxt_t_gygc gygc WHERE bom.id=gygc.bomid AND t.id=gygc.id)) DDTZ,(SELECT ddlevel FROM scglxt_t_dd dd WHERE id =t.ssdd) DDLEVEL,(SELECT endtime FROM scglxt_t_dd dd WHERE id =t.ssdd) ENDTIME  FROM
            scglxt_t_gygc t   where ( bfjs+yjgjs+sjjs <= kjgjs ) and (KJGJS-YJGJS-SJJS)!= 0 and czryid ='` + token + `' ) t where (` + where + `) order by DDLEVEL asc`;
      const data = await this.model().query(sql);
      const count = await this.model().query(countSql);
      const info = {
        count: count[0].count,
        currentPage: pageNumber,
        data: data,
        pageSize: pageSize,
        totalPages: (count[0].count + pageSize - 1) / pageSize
      };
      return this.success(info);
    } catch (ex) {
      return this.fail(ex);
    }
  }
  // 任务详情
  async getTaskDetailAction() {
    try {
      const gygcId = this.get('id');
      const bomId = this.get('bomId');
      const reSql = `SELECT gygc.id,dd.xmname ddmc,ddlevel,bom.endtime,bom.zddmc ljmc,bom.ddtz ddtz,(SELECT gymc FROM scglxt_t_jggy t WHERE t.id=gygc.gynr) gymc,edgs,kjgjs,yjgjs,zysx 'gynr',sbid,sb.mc sblx FROM scglxt_t_gygc gygc,scglxt_t_dd dd,scglxt_t_bom bom,scglxt_t_sblx sb WHERE dd.id=gygc.ssdd AND bom.id=gygc.bomid AND sb.id=gygc.sbid and gygc.id='` + gygcId + `'`;

      const sql = `SELECT gygc.id,dd.xmname ddmc,ddlevel,bom.endtime,bom.zddmc ljmc,bom.ddtz ddtz,(SELECT gymc FROM scglxt_t_jggy t WHERE t.id=gygc.gynr) gymc,edgs,kjgjs,yjgjs,zysx 'gynr',sbid,sb.mc sblx FROM scglxt_t_gygc gygc,scglxt_t_dd dd,scglxt_t_bom bom,scglxt_t_sblx sb WHERE dd.id=gygc.ssdd AND bom.id=gygc.bomid AND sb.id=gygc.sbid AND bomid='` + bomId + `' order by serial`;

      const reData = await this.model().query(reSql);
      const data = await this.model().query(sql);
      reData[0].list = data;
      return this.success(reData[0]);
    } catch (ex) {
      return this.fail(ex);
    }
  }

  // 获取某个人任务统计信息
  async getTaskStatAction() {
    const userToken = this.header('token');
    const data = {
      hour: {}
    };
    data.hour.day = await this.model('scglxt_t_jggl').where("jgryid ='" + userToken + "' and to_days(jgjssj) = to_days(now())").count();
    data.hour.week = await this.model('scglxt_t_jggl').where("jgryid ='" + userToken + "' and DATE_SUB(CURDATE(), INTERVAL 7 DAY) <= date(jgjssj)").count();
    data.hour.month = await this.model('scglxt_t_jggl').where("jgryid ='" + userToken + "' and DATE_FORMAT( jgjssj, '%Y%m' ) = DATE_FORMAT( CURDATE( ) , '%Y%m' )").count();

    return this.success(data);
  }

  // 结束加工
  // 1.更新工序已加工件数，更新使用设备，2.更新操作记录表 3.更新送检件数
  async overWorkAction() {
    const {
      gyid,
      sbid,
      jgjs,
      ddjs,
      kjgjs
    } = this.post();

    const worker = this.header('token');
    const jgjlData = {
      jgjssj: util.getNowTime(),
      jgjs: jgjs,
      sbid: sbid
    };

    const updateData = await this.model('scglxt_t_jggl').where({
      gygcid: gyid,
      jgryid: worker,
      jgjssj: null
    }).update(jgjlData);

    const oldSjjs = await this.model('scglxt_t_gygc').where({
      id: gyid
    }).getField('sjjs');
    const bomData = await this.model('scglxt_t_gygc').where({
      id: gyid
    }).update({
      sjjs: parseInt(jgjs) + parseInt(oldSjjs)
    });

    const gygcData = await this.model('scglxt_t_gygc').where({
      id: gyid
    }).find();
    if (gygcData.kjgjs != (gygcData.yjgjs + gygcData.sjjs)) // 如果加工未完成自动再开始一条加工记录
    {
      await this.model('scglxt_t_gygc').where({
        id: gyid
      }).update({
        czryid: null
      });
      // let jgjlData = {
      //     id: util.getUUId(),
      //     jgryid: worker,
      //     jgkssj: util.getNowTime(),
      //     gygcid: gyid
      // }

      // await this.model('scglxt_t_jggl').add(jgjlData)
    } else {
      const updateInfo = {
        status: 2,
        jssj: util.getNowTime(),
        sfjy: 0
      };
      // 容错处理，如果已加工件数+送检件数大于可加工件数，则默认将已加工件数更新为可加工件数

      if (gygcData.kjgjs < (gygcData.yjgjs + gygcData.sjjs)) {
        updateInfo.yjgjs = gygcData.kjgjs;
      }
      await this.model('scglxt_t_gygc').where({
        id: gyid
      }).update(updateInfo);
    }

    return this.success(bomData, '操作成功');
  }
};
