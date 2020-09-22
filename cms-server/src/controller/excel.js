const Base = require('./base.js');
const nodeExcel = require('excel-export'); // 首先，引入excel模块：

module.exports = class extends Base {
  indexAction() {
    return this.display();
  }
  // 导出Excel
  async exportExcelAction() {
    const res = this.ctx.res;
    const req = this.ctx.req;
    const tableId = this.get('tableId');
    var confs = [];
    var conf = {};
    const colArr = [];
    const colunms = await this.model('resource_table_column').getColumnList(tableId, 'EXPORT');
    const tables = await this.model('resource_table').getTableInfo(tableId);

    colunms.map(item => {
      colArr.push({
        caption: item.COLUMN_NAME,
        type: 'string'
      });
    });
    const colunmsQuery = colunms.map(item => {
      return item.COLUMN_NAME;
    });
    conf.cols = colArr;
    const tableData = await this.model('tableData').getTableData(tableId, 'EXPORT');
    const infos = [];
    tableData.map(item => {
      const datas = [];
      Object.keys(item).map(el => {
        datas.push(item[el]);
      });
      infos.push(datas);
    });

    conf.rows = infos;
    conf.name = tables.table_name;
    confs.push(conf);

    var result = nodeExcel.execute(confs);

    var name = encodeURI(tables.resource_name);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');
    res.setHeader('Content-Disposition', 'filename=' + name + '.xlsx');
    res.end(result, 'binary');
  }
};
