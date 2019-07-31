module.exports = class extends think.Model {
    async getTableData(tableId, flag, whereObj) {

        let table = await this.model('resource_table').getTableInfo(tableId);
        let displayColumn = await this.model('resource_table_column').getColumnList(tableId, flag)
        let queryColumns = [], displayColumnArr = []
        displayColumn.map(item => {
            switch (item.PROPERTY_TYPE) {
                case '1': // 文本框形式不需要翻译
                case '3': // 日期
                case '5': // 日期时间
                    displayColumnArr.push(item.COLUMN_NAME)
                    break;
                case '2': // 有外键关系,需要翻译
                    displayColumnArr.push(`(SELECT NAME FROM (${item.TYPESQL}) tras WHERE tras.id=${item.COLUMN_NAME}) ${item.COLUMN_NAME}`)
                    break;
                case '4': //字段数据
                    displayColumnArr.push(`(SELECT NAME FROM (${item.TYPESQL}) tras WHERE tras.id=${item.COLUMN_NAME}) ${item.COLUMN_NAME}`)
                    break;
                case '7': //自动填充
                    displayColumnArr.push(`${item.TYPESQL} ${item.COLUMN_NAME}`);
                    break;
                default:
                    displayColumnArr.push(item.COLUMN_NAME)
                    break;
            }
        })
        const data = await this.model(table.table_name)
            .field(displayColumnArr.join(',')).where(whereObj).select();

        return data
    }
    //执行传入的sql文件
    async executeSql(sql) {
        return this.model().execute(sql).select()
    }
};