/**
 * 首页统计需要的接口
 */
const Base = require('../base.js');
const ddModel = 'scglxt_t_dd';

module.exports = class extends Base {
  async indexAction() {
    const data = {
      ddTotal: 0,
      ddNoStart: 0,
      ddIsFinish: 0,
      ddInProcess: 0,
      bomTotal: 0,
      bomNoStart: 0,
      bomIsFinish: 0,
      bomInProcess: 0,
      peopleTotal: 0

    };
    data.ddTotal = await this.model(ddModel).count();
    data.ddIsFinish = await this.model(ddModel).where({
      'ckzt': '完成'
    }).count();
    data.ddNoStart = await this.model(ddModel).where({
      'ckzt': null
    }).count();
    data.bomNoStart = await this.model('scglxt_t_bom').where({
      'zddzt': ['=', '0501']
    }).count();
    data.bomInProcess = await this.model('scglxt_t_bom').where({
      'zddzt': ['in', '0502,0503,0504']
    }).count();
    data.bomIsFinish = await this.model('scglxt_t_bom').where({
      'zddzt': ['=', '0506']
    }).count();
    data.bomTotal = await this.model('scglxt_t_bom').count();
    data.peopleTotal = await this.model('scglxt_t_ry').count();
    return this.success(data);
  }
  // 获取设备类型排产
  async getSblxPcAction() {
    const sql = `SELECT sblx.id,sblx.mc k,ssgy,DATE_FORMAT(TIMESTAMPADD(DAY,ROUND(zgs/bzcn,2),NOW()),'%Y-%m-%d') v,fzbz,ROUND(zgs/bzcn,2) t FROM scglxt_t_sblx sblx,scglxt_t_jggy gy,v_scglxt_pc_sblx t WHERE sblx.ssgy=gy.id AND sblx.id=t.sbid`;
    const data = await this.model().query(sql);

    return this.success(data);
  }

  // 获取工艺工序排产
  async getGygxPcAction() {
    const sql = `SELECT gy.id,gy.gymc k,ssgy,fzbz,DATE_FORMAT(TIMESTAMPADD(DAY,ROUND(any_value (zgs)/any_value (bzcn),2),NOW()),'%Y-%m-%d') v,SUM(ROUND(any_value (zgs)/any_value (bzcn),2)) t FROM scglxt_t_sblx sblx,scglxt_t_jggy gy,v_scglxt_pc_gygx t WHERE sblx.ssgy=gy.id AND gy.id=t.gynr GROUP BY gy.id`;
    const data = await this.model().query(sql);

    return this.success(data);
  }

  // 根据时间范围返回工人工时统计
  async getPeopleHourAction() {
    const time = this.post('date');
    const zddmc = this.post('zddmc');
    const gynr = this.post('gynr');
    let bomSql = `SELECT bom.id,ssdd,dd.xmname ddmc,bom.jgsl,zddmc bommc FROM scglxt_t_bom bom,scglxt_t_dd dd WHERE  bom.ssdd=dd.id and bom.id IN (
            SELECT bomid FROM scglxt_t_gygc WHERE 1=1 `;
    if (gynr !== undefined && gynr !== '') {
      bomSql += `AND (gynr = '${gynr}') AND kssj BETWEEN "${time.split(' ')[0]} 00:00:00" AND "${time.split(' ')[1]}  23:59:59") And (zddmc like '%` + zddmc + `%' or xmname like '%` + zddmc + `%') order by bom.endtime,bom.ssdd desc`;
    } else {
      bomSql += `AND kssj BETWEEN "` + time.split(' ')[0] + ` 00:00:00" AND "` + time.split(' ')[1] + `  23:59:59") And (zddmc like '%` + zddmc + `%' or xmname like '%` + zddmc + `%') order by bom.endtime,bom.ssdd desc`;
    }
    const bomData = await this.model().query(bomSql);
    let sql = `SELECT any_value(gygc.id) id,
        any_value(gygc.ssdd) ssdd, any_value(xmname) ddmc, any_value(bomid) bomid,
        any_value(zddmc) bommc, any_value(gynr) gynr,any_value(jgsl) jgsl,
        any_value(jggl.jgryid) czryid, any_value(ry.rymc) rymc,(ifnull( gygc.zbgs, 0 )/(SELECT count(*) from scglxt_t_jggl where gygcid=gygc.id))+(gygc.edgs*(jggl.jgjs -ifnull(jggl.bfjs,0))) edgs
    FROM scglxt_t_gygc gygc left join scglxt_t_jggl jggl on gygc.id=jggl.gygcid, scglxt_t_dd dd, scglxt_t_bom bom, scglxt_t_ry ry 
    WHERE
        gygc.ssdd = dd.id  AND gygc.bomid = bom.id 
        And (zddmc like '%` + zddmc + `%' or xmname like '%` + zddmc + `%')`;
    if (gynr !== undefined && gynr !== '') {
      sql += `and (gynr = '${gynr}')
      AND jggl.jgryid = ry.id   AND jggl.jgjssj BETWEEN "` + time.split(' ')[0] + ` 00:00:00"
      AND "` + time.split(' ')[1] + `  23:59:59"   order by ddmc,bomid`;
    } else {
      sql += `AND jggl.jgryid = ry.id   AND jggl.jgjssj BETWEEN "` + time.split(' ')[0] + ` 00:00:00" 
      AND "` + time.split(' ')[1] + `  23:59:59"   order by ddmc,bomid`;
    }
    const data = await this.model().query(sql);

    bomData.map(item => {
      data.map(el => {
        if (item.id === el.bomid) {
          if (item[el.rymc]) {
            item[el.rymc] += el.edgs;
          } else {
            item[el.rymc] = el.edgs;
          }
        }
      });
    });
    return this.success(bomData);
  }
  // 获取车间总工时排产
  async getGygsPcAction() {
    // let sql = `SELECT gynr,gy.gymc,sum(zbgs+bzgs)/60 zgs FROM scglxt_t_gygc gc,scglxt_t_jggy gy WHERE gc.gynr=gy.id AND bomid IN (
    //     SELECT id FROM scglxt_t_bom bom WHERE zddzt IN ('0501','0502')) GROUP BY gynr`

    const sql = `SELECT gynr,gy.gymc,TRUNCATE(zgs/60,2) zgs from v_scglxt_pc_gygx gc,scglxt_t_jggy gy WHERE gc.gynr=gy.id`;

    const data = await this.model().query(sql);

    return this.success(data);
  }

  // 获取订单动态剩余工时
  async getDDWorkSpeedAction() {
    const query = this.post();
    let whereObj = '1=1  group by dd.id desc ORDER BY DDLEVEL,dd.sjcjsj DESC,ddorder desc';
    if (query.xmname && query.xmname !== '') {
      whereObj = `1=1 and dd.xmname like '%` + query.xmname + `%' group by dd.id desc ORDER BY DDLEVEL,dd.sjcjsj DESC,ddorder desc`;
    }
    if (query.ddid && query.ddid !== '') {
      whereObj = `1=1 and dd.id='` + query.ddid + `' group by dd.id desc ORDER BY DDLEVEL,dd.sjcjsj DESC,ddorder desc`;
    }
    if (!query.isCustom) {
      whereObj = ' dd.isshow=1  group by dd.id desc order by dd.ddorder+1 asc';
    }

    const sql = `  
        SELECT
            dd.id,
            dd.xmname,
            dd.starttime,
            dd.endtime,
            ht.remark mark,
             MAX(CASE gynr WHEN '201609010949574021' THEN sygs ELSE 0 END ) 'xqg',
             MAX(CASE gynr WHEN '201609010949574022' THEN sygs ELSE 0 END ) 'xi',
            MAX(CASE gynr WHEN '201609010949574025' THEN sygs ELSE 0 END ) 'qian',
            MAX(CASE gynr WHEN '201609010949574023' THEN sygs ELSE 0 END ) 'zhusu',
            MAX(CASE gynr WHEN '201609010949574024' THEN sygs ELSE 0 END ) 'che',
            MAX(CASE gynr WHEN '201609010949574026' THEN sygs ELSE 0 END ) 'cnc',
            MAX(CASE gynr WHEN '201609010949574027' THEN sygs ELSE 0 END ) 'dhh',
            MAX(CASE gynr WHEN '201609010949574028' THEN sygs ELSE 0 END ) 'mo',
            MAX(CASE gynr WHEN '20170424203552800'  THEN sygs ELSE 0 END ) 'rechuli',
            MAX(CASE gynr WHEN '20170724160856037'  THEN sygs ELSE 0 END ) 'hanjie',
            MAX(CASE gynr WHEN '20170524144646657'  THEN sygs ELSE 0 END ) 'waixie' ,
            sum(sygs) sygs
        FROM
        scglxt_t_ht ht,scglxt_t_dd dd ,v_scglxt_sygs sygs where ht.id=dd.ssht and sygs<>0 and dd.id =sygs.ddid and dd.ckzt is null and ` + whereObj + ``;

    const data = await this.model().query(sql);

    return this.success(data);
  }

  // 获取当前登录用户当天的工作记录
  async getPersonalDayAction() {
    const token = this.header('token');

    const sql = `SELECT t.id,(
      SELECT xmname FROM scglxt_t_dd WHERE id=gygc.ssdd) ddmc,(
      SELECT zddmc FROM scglxt_t_bom WHERE id=gygc.bomid) bommc,t.jgjs,(
      SELECT rymc FROM scglxt_t_ry WHERE id=t.jyryid) jyrymc,t.jgkssj,t.jgjssj,t.sbid,(
      SELECT sbmc FROM scglxt_t_sb WHERE id=t.sbid) sbmc,(gygc.bzgs+gygc.zbgs) bzgs,gygc.edgs,t.sfjy FROM scglxt_t_jggl t,scglxt_t_gygc gygc WHERE t.gygcid=gygc.id AND date(jgjssj)=curdate() AND jgryid='${token}' order by gygc.ssdd`;

    const data = await this.model().query(sql);

    return this.success(data);
  }

  async exportPersonalStatAction() {
  }

  // 获取班组工作台所需数据面板
  async getTeamStatAction() {
    const {gynr} = this.get();

    const sygs = this.model('v_scglxt_sygs').where({
      gynr: gynr
    }).sum('gynr');

    const data = {
      syzgs: sygs || 0
    };

    return this.success(data);
  }

  // 获取总工作台所需数据  默认查询近七天的工艺完成情况

  async getAdminStatAction() {
    const sql = `SELECT jggy.id,jggy.gymc,sum(edgs) edgs,DATE_FORMAT(jssj,'%Y-%m-%d') jssj FROM scglxt_t_gygc gygc,scglxt_t_jggy jggy WHERE gygc.gynr=jggy.id AND DATE_SUB(CURDATE(),INTERVAL 7 DAY)<=date(jssj) GROUP BY DATE_FORMAT(jssj,'%Y-%m-%d'),gynr ORDER BY gymc,jssj`;

    const datas = await this.model().query(sql);
    const xData = await this.model('scglxt_t_gygc').where('DATE_SUB( CURDATE(), INTERVAL 7 DAY )<= date( jssj )').group(`DATE_FORMAT( jssj, '%Y-%m-%d' )`).getField(`DATE_FORMAT( jssj, '%Y-%m-%d' ) jssj`);

    const legend = await this.model('scglxt_t_jggy').where({sftj: '1'}).field('id,gymc name').select();
    // const pArr = [];
    legend.forEach(item => {
      // pArr.push(this.getGyDatas(item, xData));
      item.data = [];
      item.type = 'line';
      xData.map(el => {
        const tmp = datas.filter(v => {
          return v.jssj === el && v.id === item.id;
        });
        if (tmp.length > 0) {
          item.data.push(tmp[0]['edgs']);
        } else {
          item.data.push(0);
        }
      });
    });

    // await Promise.all(pArr);
    const data = {
      legend: legend.map(el => el.name),
      xAxis: xData,
      series: legend
    };
    return this.success(data);
  }

  // 判断当前工艺是新增还是修改
  async getGyDatas(item, dates) {
    return new Promise(async resolve => {
      const wjData = await this.model('scglxt_t_gygc').where(`DATE_SUB(CURDATE(),INTERVAL 7 DAY)<=date(jssj) and gynr='${item.id}'`).field(`sum(edgs) edgs,DATE_FORMAT(jssj,'%Y-%m-%d') jssj`).group(`DATE_FORMAT(jssj,'%Y-%m-%d')`).select();
      item.data = [];
      item.type = 'line';
      // for (let i = 0; i < dates.length; i++) {
      //   const tmp = wjData.find(v => v.jssj === dates[i]);
      // }
      dates.map(el => {
        const tmp = wjData.filter(v => {
          return v.jssj === el;
        });
        if (tmp.length > 0) {
          item.data.push(tmp[0]['edgs']);
        } else {
          item.data.push(0);
        }
      });
      resolve();
    });
  }
};
