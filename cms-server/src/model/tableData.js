module.exports = class extends think.Model {
  async getTableData(tableId, flag, whereObj) {
    const table = await this.model('resource_table').getTableInfo(tableId);
    const displayColumn = await this.model('resource_table_column').getColumnList(tableId, flag);
    let queryColumns = [],
      displayColumnArr = [];
    displayColumn.map(item => {
      switch (item.PROPERTY_TYPE) {
        case '1': // 文本框形式不需要翻译
        case '3': // 日期
        case '5': // 日期时间
          displayColumnArr.push(item.COLUMN_NAME);
          break;
        case '2': // 有外键关系,需要翻译
          displayColumnArr.push(`(SELECT NAME FROM (${item.TYPESQL}) tras WHERE tras.id=${item.COLUMN_NAME}) ${item.COLUMN_NAME}`);
          break;
        case '4': // 字段数据
          displayColumnArr.push(`(SELECT NAME FROM (${item.TYPESQL}) tras WHERE tras.id=${item.COLUMN_NAME}) ${item.COLUMN_NAME}`);
          break;
        case '7': // 自动填充
          displayColumnArr.push(`${item.TYPESQL} ${item.COLUMN_NAME}`);
          break;
        case '13': // 附件的话，外链表，单独查询
          break;
        default:
          displayColumnArr.push(item.COLUMN_NAME);
          break;
      }
    });
    const data = await this.model(table.table_name)
      .field(displayColumnArr.join(',')).where(table.where_sql).where(whereObj).alias('t').select();

    return data;
  }
  // 执行传入的sql文件
  async executeSql(sql) {
    return this.model().execute(sql).select();
  }

  // 获取查询对象
  async getWhereObj(query, queryColumn, queryKey, tableId) {
    const _this = this;
    const displayColumn = await this.model('resource_table_column').getColumnList(tableId);
    let queryColumns = [],
      displayColumnArr = [];
    const data = {};
    const whereObj = {};
    let pArr = [],
      temp = {};

    if (query && query !== '{}' && JSON.stringify(query) !== '{}') {
      query = JSON.parse(query);
      Object.keys(query).map(key => {
        // 如果是数组
        if (query[key].length > 0) {
          if (Array.isArray(query[key])) {
            whereObj[key] = ['between', `${query[key][0]}`, `${query[key][1]}`];
          } else if (query[key] === null) {
            whereObj[key] = null;
          } else if (query[key].toString().indexOf('not null') !== -1) {
            whereObj[key] = ['!=', null];
          } else {
            whereObj[key] = ['=', `${query[key]}`];
          }
        }
      });
    }
    if (queryKey.length > 0) {
      await displayColumn.map(async(item) => {
        if (item.ISQUERY == '1') {
          switch (item.PROPERTY_TYPE) {
            case '1': // 文本框形式不需要翻译
            case '3': // 日期
            case '5': // 日期时间
              queryColumns.push({
                key: item.COLUMN_NAME,
                value: queryKey,
                type: false
              });
              break;
            case '2': // 有外键关系,需要翻译
              pArr.push(_this.getData(queryColumns, item, queryKey));
              break;
            case '4': // 字段数据
            case '13': // 附件
              break;
            default:
              queryColumns.push({
                key: item.COLUMN_NAME,
                value: queryKey,
                type: false
              });
              break;
          }
        }
      });
      if (pArr.length > 0) {
        await Promise.all(pArr).then(async() => {
          const complex = {
            _logic: 'or'
          };
          queryColumns.map(item => {
            if (item.type) {
              complex[`t.${item.key}`] = ['in', `${item.value}`];
            } else {
              complex[`${item.key}`] = ['like', `%${item.value}%`];
            }
          });
          if (queryColumns.length > 0) {
            whereObj._complex = complex;
          }
        });
      }
      if (queryColumns.length > 0) {
        const complex = {
          _logic: 'or'
        };
        queryColumns.map(item => {
          if (item.type) {
            complex[`t.${item.key}`] = ['in', `${item.value}`];
          } else {
            complex[`${item.key}`] = ['like', `%${item.value}%`];
          }
        });
        whereObj._complex = complex;
      } else {
        if (queryColumn != '' && queryColumn) {
          whereObj[`CONCAT(${queryColumn})`] = ['like', `%${queryKey}%`];
        }
      }
    }

    return whereObj;
  }

  executePromise(arr) {

  }
  getData(queryColumns, item, queryKey) {
    const vm = this;
    return new Promise(async resolve => {
      const wjData = await this.query(`(SELECT id FROM (${item.TYPESQL}) tras WHERE tras.name like '%${queryKey}%')`);
      if (wjData.length > 0) {
        const value = [];
        wjData.map(item => {
          value.push(item.id);
        });
        queryColumns.push({
          type: true,
          key: item.COLUMN_NAME,
          value: value.join(',')
        });
      }
      resolve();
    });
  }
};
