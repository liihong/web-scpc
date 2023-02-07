const Base = require('./base.js');

module.exports = class extends Base {
  async indexAction() {
    return 'hahah';
  }
  // 编辑字段配置统一保存
  async addTableResColumnsAction() {
    const tableId = this.post('tableId');
    const updateInfos = this.post('form');

    const deleteInfo = await this.model('resource_table_column').where({
      table_id: ['=', tableId]
    }).delete();
    console.log(deleteInfo);
    const data = await this.model('resource_table_column').addMany(updateInfos, {
      pk: 'COLUMN_ID',
      where: `TABLE_ID=${tableId}`
    });
    return this.success(data);
  }
  // 编辑字段配置统一保存
  async editTableResColumnsAction() {
    const tableId = this.post('tableId');
    const updateInfos = this.post('form');
    console.log(updateInfos);
    const data = await this.model('resource_table_column').updateMany(updateInfos, {
      pk: 'COLUMN_ID',
      where: `TABLE_ID=${tableId}`
    });
    return this.success(data);
  }

  // 获取配置表的字段属性
  async getResColumnDataAction() {
    const tableId = this.get('tableId');
    const model = this.model('resource_table_column');
    const data = await model.order('QUERY_ORDER ASC').where({
      table_id: ['=', tableId]
    }).select();
    return this.success(data);
  }
  async getTableColumnAction() {
    try {
      const tableId = this.get('tableId');

      const displayColumn = await this.model('resource_table_column').getColumnList(tableId, this.get('flag'));

      return this.success(displayColumn);
    } catch (err) {
      return this.fail(err);
    }
  }

  async getDropDownListDataAction() {
    try {
      const sql = this.get('typesql');
      if (sql.includes('SELECT') || sql.includes('select')) {
        const data = await this.model('resource_table_column').getTypeSqlData(sql);
        return this.success(data);
      } else {
        return this.fail({
          msg: '只能执行查询语句',
          code: 0
        });
      }
    } catch (err) {
      return this.fail(err);
    }
  }

  // 根据外键配置查询数据
  async getForeingKeyListDataAction() {
    try {
      const tableId = this.get('tableId');
      const column_name = this.get('column_name');
      const query = this.get('query');

      const columnData = await this.model('resource_table_column').where({
        table_id: tableId,
        column_name: column_name
      }).find();

      const whereObj = {};
      whereObj[columnData.FOREIGNKEY_TABLE_COLUMN] = query;
      const data = await this.model(columnData.FOREIGNKEY_TABLENAME).where(whereObj).select();
      return this.success(data);
    } catch (err) {
      return this.fail(err);
    }
  }

  // 删除外键表数据根据ID
  async DeleteForeingDataByIdAction() {
    const {tableId, column_name, id} = this.post();
    const whereObj = {};

    const columnData = await this.model('resource_table_column').where({
      table_id: tableId,
      column_name: column_name
    }).find();

    // whereObj[columnData.FOREIGNKEY_TABLE_COLUMN] = query
    whereObj['id'] = id;
    const data = await this.model(columnData.FOREIGNKEY_TABLENAME).where(whereObj).delete();
    return this.success(data);
  }
};
