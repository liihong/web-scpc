import util from '../../../utils/util';
/**
 * 报价单操作的接口
 */
const Base = require("../base.js");

module.exports = class extends Base {
  // 获取合同列表
  async getHtListAction() {
    const pageNumber = this.post("pageNumber");
    const pageSize = this.post("pageSize");
    const queryKey = this.post("queryKey");
    const curPage = (pageNumber - 1) * pageSize;
    const gynr = this.post("gynr");
    let where = "1=1";

    if (queryKey) {
      where =
        "SSDD like '%" +
        queryKey +
        "%' or HTBH like '%" +
        queryKey +
        "%' or KHID_TEXT like '%" +
        queryKey +
        "%'";
    }
    if (gynr && gynr !== "") {
      where += ` and  gynr = '${gynr}'`;
    }
    const sql =
      `SELECT * from (
        SELECT t.ID,kh.mc KHID_TEXT,t.HTBH,t.HTJC,t.REMARK,t.YWLX,(
          SELECT mc NAME FROM scglxt_tyzd tras WHERE xh LIKE '31__' AND tras.id=t.YWLX) YWLX_TEXT, t.SPZT,t.QSSJ,t.JSSJ,t.HTJE,t.BJDZJ,t.FKZT,(
          SELECT mc NAME FROM scglxt_tyzd tras WHERE xh LIKE '32__' AND tras.id=t.FKZT) FKZT_TEXT,t.KPZT,dd.xmname SSDD,dd.zgs ZGS,dd.DQJD FROM scglxt_t_ht t LEFT JOIN scglxt_t_kh kh ON t.khid=kh.id LEFT JOIN scglxt_t_dd dd ON t.id=dd.ssht ORDER BY t.qssj DESC
        ) t where (` +
      where +
      `)  limit ` +
      curPage +
      `,` +
      pageSize +
      `;`;

    const countSql =
      `SELECT count(*) count  FROM (
        SELECT t.ID,kh.mc KHID_TEXT,t.HTBH,t.HTJC,t.REMARK,t.YWLX,t.SPZT,t.QSSJ,t.JSSJ,t.HTJE,t.BJDZJ,t.FKZT,t.KPZT,dd.xmname SSDD,dd.zgs ZGS,dd.DQJD FROM scglxt_t_ht t LEFT JOIN scglxt_t_kh kh ON t.khid=kh.id LEFT JOIN scglxt_t_dd dd ON t.id=dd.ssht ORDER BY t.qssj DESC
     
       ) t where (` +
      where +
      `)`;
    const data = await this.model().query(sql);
    const count = await this.model().query(countSql);
    const info = {
      count: count[0].count,
      currentPage: pageNumber,
      data: data,
      pageSize: pageSize,
      totalPages: (count[0].count + pageSize - 1) / pageSize,
    };
    return this.success(info);
  }

  // 合同金额统计
  async getHttjByDateAction() {
    const time = this.post("date");
    const htmc = this.post("htmc");
    let bomSql = `SELECT ht.id,kh.mc,ht.htbh,ht.remark,dd.xmname,kh.lxr,kh.lxdh,ht.qssj,ht.jssj,ht.htje,ht.jkje,ht.bjdzj,ht.wksj,ht.wkzt,ht.yfzt,ht.yfsj,ht.kpzt FROM scglxt_t_kh kh,scglxt_t_ht ht LEFT JOIN scglxt_t_dd dd ON ht.id=dd.ssht WHERE ht.khid=kh.id  `;
    if (time !== undefined && time !== "") {
      bomSql +=
        ` and ht.sjcjsj BETWEEN  "` +
        time.split(" ")[0] +
        ` 00:00:00" AND "` +
        time.split(" ")[1] +
        `  23:59:59" And (kh.mc like '%` +
        htmc +
        `%' or ht.htbh like '%` +
        htmc +
        `%') order by ht.qssj desc`;
    }
    const bomData = await this.model().query(bomSql);
    
    return this.success(bomData);
  }

  // 销售合同开发票
  async addHTFPAction() {
    const ids = this.post('ids');
    const names = this.post('names');
    const ssht = this.post('ssht');
    const vm = this;
    
    const id = util.getUUId();
    const data = {
      id: id,
      ssht: ssht,
      bjdid: ids.join(','),
      ljmc: names.join(','),
      kprid: this.header('token')
    };

    await this.model('scglxt_t_ht_bjd').where({
      id: ids
    }).update({
      fph: id
    });

    await this.model('scglxt_t_ht').where({
      id: ssht
    }).update({
      kpzt: '已开',
      kpsj: util.getNowTime()
    });

    const result = await this.model('scglxt_t_fp').add(data);

    return vm.success(result);
  }

  // 回款记录
  async addRefundAction() {
    const htid = this.post('htid');
    const fkzt = this.post('fkzt');
    const jkje = this.post('jkje');

    const data = await this.model('scglxt_t_ht').where({id: htid}).update({
      fkzt: fkzt,
      jkje: jkje
    });
    
    return this.success(data);
  }

  // 销售统计-客户行业统计
  async getKHHYStatAction() {
    const time = this.post('date');
   
    let whereSql = ` 1 = 1`;
    if (time !== undefined && time !== '') {
      whereSql =
        ` ht.jssj BETWEEN  "` +
        time.split(' ')[0] +
        ` 00:00:00" AND "` +
        time.split(' ')[1] +
        `  23:59:59" `;
    } else {
      return this.fail();
    }
    const khhySql = `SELECT zd.mc name,ROUND(sum(ht.htje),2) value from scglxt_t_kh kh,scglxt_t_ht ht,scglxt_tyzd zd where ht.khid = kh.id and  kh.lx=zd.id
    AND ` + whereSql + 'GROUP BY kh.lx';
    const bomData = await this.model().query(khhySql);

    const khlxSql = `SELECT zd.mc name,ROUND(sum(ht.htje),2) value from scglxt_t_kh kh,scglxt_t_ht ht,scglxt_tyzd zd where ht.khid = kh.id and  kh.hyfl=zd.id
    AND ` + whereSql + 'GROUP BY kh.hyfl';
    
    const khlxData = await this.model().query(khlxSql);

    const khSql = `SELECT kh.id id,kh.mc,zd.mc khlx,ROUND(sum(ht.htje),2)  FROM scglxt_t_ht ht,scglxt_t_kh kh LEFT JOIN scglxt_tyzd zd ON kh.lx=zd.id WHERE ht.khid=kh.id AND ht.jssj BETWEEN "${time.split(' ')[0]} 00:00:00" AND "${time.split(' ')[1]} 23:59:59" GROUP BY kh.id`;

    const khData = await this.model().query(khSql);

    const data = {
      khhy: bomData,
      khlx: khlxData,
      khtj: khData
    };
    
    return this.success(data);
  }
};
