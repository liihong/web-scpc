const XLSX = require('xlsx-style');
const path = require('path');
const xlsxUtils = require('./xlsxUtils');
var _exports = {};
module.exports = _exports;

_exports.exportXls = function(data, list, res, type, tjInfo) {
  // 打开文件
  let PUBLIC_PATH = path.resolve(__dirname, 'zjModel.xlsx');
  if (type == '1') { // 如果type==1说明是默认导出带金额的
    PUBLIC_PATH = path.resolve(__dirname, 'zjModel1.xlsx');
  } else {
    PUBLIC_PATH = path.resolve(__dirname, 'zjModel.xlsx');
  }

  const workbook2 = XLSX.readFile(PUBLIC_PATH, {
    cellStyles: true
  });
  const wsname = workbook2.SheetNames[0]; // 取第一张表
  const header = workbook2.Sheets[wsname]; // 生成json表格内容

  header.A1.v = header.A1.v + data.xmname;
  header.A1.h = header.A1.h + data.xmname;
  header.C2.v = data.htbh;
  header.C3.v = data.xmname;
  header.C4.v = data.starttime;
  header.H4.v = data.endtime;
  header.C5.v = data.ddlevel;
  header.A1.s = {
    alignment: {
      horizontal: 'center',
      vertical: 'center'
    },
    font: {
      name: '宋体',
      sz: 26,
      bold: true,
      color: {
        rgb: 'FF0000'
      }
    }
  }; // <====设置xlsx单元格样式

  var keyMap = ['xh', 'ljmc', 'ljcz', 'ljgg', 'jgsl', 'ljlx', 'sccj', 'zjee', 'yjdhrq', 'endtime', 'bz'];
  if (type == '1') {
    keyMap = ['xh', 'ljmc', 'ljcz', 'ljgg', 'jgsl', 'ljlx', 'sccj', 'dj', 'zje', 'endtime', 'bz'];
  }
  var dataList = xlsxUtils.format2Sheet(list, 0, 7, keyMap); // 偏移8行按keyMap顺序转换

  // dd
  if (type == '1') {
    var d2 = xlsxUtils.format2Sheet([tjInfo], 0, list.length + 7, ['zgs', '', '', '', '', '', '', '', '', '', '']);
    dataList = Object.assign(dataList, d2);
  }
  var dataKeys = Object.keys(dataList);
  // ddd
  for (var k in header) dataList[k] = header[k]; // 追加列头
  // 合并统计行
  dataList['!merges'].push({
    s: { // s为开始
      c: 0, // 开始列
      r: list.length + 7 // 可以看成开始行,实际是取值范围
    },
    e: { // e结束
      c: 7, // 结束列
      r: list.length + 7 // 结束行
    }
  });

  var wb = xlsxUtils.format2WB(dataList, data.xmname, undefined, 'A1:' + dataKeys[dataKeys.length - 1]);

  // 浏览器端和node共有的API,实际上node可以直接使用xlsx.writeFile来写入文件,但是浏览器没有该API
  const result = XLSX.write(wb, {
    bookType: 'xlsx', // 输出的文件类型
    type: 'buffer', // 输出的数据类型
    compression: true // 开启zip压缩
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');
  res.setHeader('Content-Disposition', 'filename=' + data.xmname + '.xlsx');
  res.end(result, 'buffer');
};

_exports.exportBOMXls = function(data, list, tjInfo, res) {
  // 打开文件
  const PUBLIC_PATH = path.resolve(__dirname, 'bomModel.xlsx');

  const workbook2 = XLSX.readFile(PUBLIC_PATH, {
    cellStyles: true
  });
  const wsname = workbook2.SheetNames[0]; // 取第一张表
  const wsgy = workbook2.SheetNames[1]; // 取第一张表

  const header = workbook2.Sheets[wsname]; // 生成json表格内容

  header.A1.v = header.A1.v + data.xmname;
  header.A1.h = header.A1.h + data.xmname;
  header.C2.v = data.htbh;
  header.C3.v = data.xmname;
  header.C4.v = data.starttime;
  header.H4.v = data.endtime;
  header.C5.v = data.ddlevel;
  header.A1.s = {
    alignment: {
      horizontal: 'center',
      vertical: 'center'
    },
    font: {
      name: '宋体',
      sz: 26,
      bold: true,
      color: {
        rgb: 'FF0000'
      }
    }
  }; // <====设置xlsx单元格样式
  header.A2.s = {
    fgColor: {
      rgb: 'FFFFFF'
    }
  };
  var keyMap = ['rownum', 'zddmc', 'clmc', 'cldx', 'jgsl', 'gxnr', 'bmcl', 'bz', 'endtime'];
  var dataList = xlsxUtils.format2Sheet(list, 0, 7, keyMap); // 偏移8行按keyMap顺序转换

  var d2 = xlsxUtils.format2Sheet([tjInfo], 0, list.length + 7, ['info', '', '', '', '', '', '', '', 'zgs']);

  dataList = Object.assign(dataList, d2);

  var dataKeys = Object.keys(dataList);

  for (var k in header) dataList[k] = header[k]; // 追加列头

  // 合并统计行
  dataList['!merges'].push({
    s: { // s为开始
      c: 0, // 开始列
      r: list.length + 7 // 可以看成开始行,实际是取值范围
    },
    e: { // e结束
      c: 7, // 结束列
      r: list.length + 7 // 结束行
    }
  });

  const wb = xlsxUtils.format2WB(dataList, data.xmname, null, 'A1:' + dataKeys[dataKeys.length - 1]);

  wb.SheetNames.push('工艺工时');

  // 开始编制BOM工艺卡
  wb.Sheets['工艺工时'] = wsgy;

  // const bomHeader = workbook2.Sheets[wsgy]; // 生成BOM 的json表格内容
  // console.log(bomHeader);

  // 浏览器端和node共有的API,实际上node可以直接使用xlsx.writeFile来写入文件,但是浏览器没有该API
  const result = XLSX.write(wb, {
    bookType: 'xlsx', // 输出的文件类型
    type: 'buffer', // 输出的数据类型
    compression: true // 开启zip压缩
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');
  res.setHeader('Content-Disposition', 'filename=1111.xlsx');
  res.end(result, 'buffer');
};

// 导出订单备料
_exports.exportDdBlXls = function(data, list, tjInfo, res) {
  // 打开文件
  const PUBLIC_PATH = path.resolve(__dirname, 'clModel.xlsx');

  const workbook2 = XLSX.readFile(PUBLIC_PATH, {
    cellStyles: true
  });
  const wsname = workbook2.SheetNames[0]; // 取第一张表
  const header = workbook2.Sheets[wsname]; // 生成json表格内容

  header.A1.v = header.A1.v + data.xmname;
  header.A1.h = header.A1.h + data.xmname;
  header.C3.v = data.xmname;
  header.C2.v = data.htbh;
  header.C4.v = data.starttime == null ? '' : data.starttime;
  header.H4.v = data.endtime;
  header.C5.v = data.ddlevel;
  header.A1.s = {
    alignment: {
      horizontal: 'center',
      vertical: 'center'
    },
    font: {
      name: '宋体',
      sz: 26,
      bold: true,
      color: {
        rgb: 'FF0000'
      }
    }
  }; // <====设置xlsx单元格样式
  header.A2.s = {
    fgColor: {
      rgb: 'FFFFFF'
    }
  };
  var keyMap = ['rownum', 'zddmc', 'clmc', 'cldx', 'bljs', 'jgsl', 'clzl', 'cldj', 'clje'];
  var dataList = xlsxUtils.format2Sheet(list, 0, 7, keyMap); // 偏移8行按keyMap顺序转换

  var d2 = xlsxUtils.format2Sheet([tjInfo], 7, list.length + 7, ['info', 'zgs']);

  dataList = Object.assign(dataList, d2);

  var dataKeys = Object.keys(dataList);

  for (var k in header) dataList[k] = header[k]; // 追加列头

  const wb = xlsxUtils.format2WB(dataList, data.xmname, undefined, 'A1:' + dataKeys[dataKeys.length - 1]);

  // 浏览器端和node共有的API,实际上node可以直接使用xlsx.writeFile来写入文件,但是浏览器没有该API
  const result = XLSX.write(wb, {
    bookType: 'xlsx', // 输出的文件类型
    type: 'buffer', // 输出的数据类型
    compression: true // 开启zip压缩
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');
  res.setHeader('Content-Disposition', 'filename=' + data.xmname + '.xlsx');
  res.end(result, 'buffer');
};

// 导出订单备料不带金额
_exports.exportDdBlNoMoney = function(data, list, tjInfo, res) {
  // 打开文件
  const PUBLIC_PATH = path.resolve(__dirname, 'clModel2.xlsx');

  const workbook2 = XLSX.readFile(PUBLIC_PATH, {
    cellStyles: true
  });
  const wsname = workbook2.SheetNames[0]; // 取第一张表
  const header = workbook2.Sheets[wsname]; // 生成json表格内容

  header.A1.v = header.A1.v + data.xmname;
  header.A1.h = header.A1.h + data.xmname;
  header.C3.v = data.xmname;
  header.C2.v = data.htbh;
  header.C4.v = data.starttime == null ? '' : data.starttime;
  header.H4.v = data.endtime;
  header.C5.v = data.ddlevel;
  header.A1.s = {
    alignment: {
      horizontal: 'center',
      vertical: 'center'
    },
    font: {
      name: '宋体',
      sz: 26,
      bold: true,
      color: {
        rgb: 'FF0000'
      }
    }
  }; // <====设置xlsx单元格样式
  header.A2.s = {
    fgColor: {
      rgb: 'FFFFFF'
    }
  };
  var keyMap = ['rownum', 'zddmc', 'clmc', 'cldx', 'bljs', 'jgsl', 'clzl', 'llr'];
  var dataList = xlsxUtils.format2Sheet(list, 0, 7, keyMap); // 偏移8行按keyMap顺序转换

  var dataKeys = Object.keys(dataList);

  for (var k in header) dataList[k] = header[k]; // 追加列头

  const wb = xlsxUtils.format2WB(dataList, data.xmname, undefined, 'A1:' + dataKeys[dataKeys.length - 1]);

  // 浏览器端和node共有的API,实际上node可以直接使用xlsx.writeFile来写入文件,但是浏览器没有该API
  const result = XLSX.write(wb, {
    bookType: 'xlsx', // 输出的文件类型
    type: 'buffer', // 输出的数据类型
    compression: true // 开启zip压缩
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');
  res.setHeader('Content-Disposition', 'filename=' + data.xmname + '.xlsx');
  res.end(result, 'buffer');
};

// 导出个人工时统计
_exports.exportPersonalStat = function() {
// 打开文件
  const PUBLIC_PATH = path.resolve(__dirname, 'clModel.xlsx');

  const workbook2 = XLSX.readFile(PUBLIC_PATH, {
    cellStyles: true
  });
  const wsname = workbook2.SheetNames[0]; // 取第一张表
  const header = workbook2.Sheets[wsname]; // 生成json表格内容

  header.A1.v = header.A1.v + data.xmname;
  header.A1.h = header.A1.h + data.xmname;
  header.C3.v = data.xmname;
  header.C2.v = data.htbh;
  header.C4.v = data.starttime == null ? '' : data.starttime;
  header.H4.v = data.endtime;
  header.C5.v = data.ddlevel;
  header.A1.s = {
    alignment: {
      horizontal: 'center',
      vertical: 'center'
    },
    font: {
      name: '宋体',
      sz: 26,
      bold: true,
      color: {
        rgb: 'FF0000'
      }
    }
  }; // <====设置xlsx单元格样式
  header.A2.s = {
    fgColor: {
      rgb: 'FFFFFF'
    }
  };
  var keyMap = ['rownum', 'zddmc', 'clmc', 'cldx', 'bljs', 'jgsl', 'clzl', 'cldj', 'clje'];
  var dataList = xlsxUtils.format2Sheet(list, 0, 7, keyMap); // 偏移8行按keyMap顺序转换

  var d2 = xlsxUtils.format2Sheet([tjInfo], 7, list.length + 7, ['info', 'zgs']);

  dataList = Object.assign(dataList, d2);

  var dataKeys = Object.keys(dataList);

  for (var k in header) dataList[k] = header[k]; // 追加列头

  const wb = xlsxUtils.format2WB(dataList, data.xmname, undefined, 'A1:' + dataKeys[dataKeys.length - 1]);

  // 浏览器端和node共有的API,实际上node可以直接使用xlsx.writeFile来写入文件,但是浏览器没有该API
  const result = XLSX.write(wb, {
    bookType: 'xlsx', // 输出的文件类型
    type: 'buffer', // 输出的数据类型
    compression: true // 开启zip压缩
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');
  res.setHeader('Content-Disposition', 'filename=' + data.xmname + '.xlsx');
  res.end(result, 'buffer');
};

// 导出个人中心今日日报表
_exports.exportPersonalDay = function(data, list, tjInfo, res) {
  // 打开文件
  const PUBLIC_PATH = path.resolve(__dirname, 'dayModel.xlsx');

  const workbook2 = XLSX.readFile(PUBLIC_PATH, {
    cellStyles: true
  });
  const wsname = workbook2.SheetNames[0]; // 取第一张表
  const header = workbook2.Sheets[wsname]; // 生成json表格内容

  header.B2.v = data.bzmc;
  header.D2.v = data.rymc;
  header.F2.v = data.today;
  header.H2.v = data.hours;
  header.A1.s = {
    alignment: {
      horizontal: 'center',
      vertical: 'center'
    },
    font: {
      name: '宋体',
      sz: 26,
      bold: true,
      color: {
        rgb: '000000'
      }
    }
  }; // <====设置xlsx单元格样式

  var keyMap = ['rownum', 'ddmc', 'bommc', 'jgjs', 'complete', 'edgs', 'edzgs', 'bzgs'];
  var dataList = xlsxUtils.format2Sheet(list, 0, 3, keyMap); // 偏移8行按keyMap顺序转换

  var d2 = xlsxUtils.format2Sheet(tjInfo, 5, list.length + 3, ['info', 'edzgs', 'jhzgs']);

  dataList = Object.assign(dataList, d2);

  var dataKeys = Object.keys(dataList);

  for (var k in header) dataList[k] = header[k]; // 追加列头

  const wb = xlsxUtils.format2WB(dataList, data.xmname, undefined, 'A1:' + dataKeys[dataKeys.length - 1]);

  // 浏览器端和node共有的API,实际上node可以直接使用xlsx.writeFile来写入文件,但是浏览器没有该API
  const result = XLSX.write(wb, {
    bookType: 'xlsx', // 输出的文件类型
    type: 'buffer', // 输出的数据类型
    compression: true // 开启zip压缩
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');
  res.setHeader('Content-Disposition', 'filename=' + data.today + '.xlsx');
  res.end(result, 'buffer');
};
