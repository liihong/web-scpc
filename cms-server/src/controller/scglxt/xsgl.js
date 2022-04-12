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
};
