module.exports = class extends think.Model {
    async getTableInfo(tableId){
        let table = await this.field(['table_id,table_name,resource_name,where_sql,orderby_sql,after_delete_type,after_delete_sql']).where({
            table_id: ['=', tableId]
        }).find();
        return table
    }
};
