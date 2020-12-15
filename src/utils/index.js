/**
 * Created by lihong
 */

export function parseTime (time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (('' + time).length === 10) time = parseInt(time) * 1000
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}
/**
 * 判断传入对象的数据类型,返回对象字符串
 * String
 * Number
 * Array
 * Date
 * Function
 * Function
 * @param {*} obj
 */
export function typeOfObj (obj) {
  let objType = Object.prototype.toString.call(obj)
  return objType.replace('[object ', '').replace(']', '')
}
/**
 * 判断字符串是否为空
 * @param {*} str 
 */
export function isNotEmpty (str) {
  let flag = false
  if (str != null && str != undefined && str != '' && str != 'null') {
    flag = true
  }
  return flag
}

export function formatTime (time, option) {
  time = +time * 1000
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}
/**
 * 将一组数据格式化为tree所需数据，根据arr分割
 * @param {数据} arr 
 * @param {识别属性} id
 * @param {分割属性} attr 
 */
export function formatTreeData (arr, id, attr) {
  let treeData = []
  // 提取出父目录
  let parentArr = arr.filter((doc) => {
    return doc[attr] == '0'
  });
  // 提取出子菜单
  let childArr = arr.filter((doc) => {
    return doc[attr] != '0'
  });
  parentArr.map(item => {
    let routerObj = item;
    let children = []
    childArr.forEach(child => {
      if (item[id] == child[attr]) {
        children.push(child)
      }
    })
    routerObj.children = children
    treeData.push(routerObj)
  })
  return treeData
}
export function objToFormData (obj) {
  var params = new FormData()
  Object.keys(obj).map(function (item) {
    params.append(item, obj[item])
  })
  return params
}
/**
 * 根据时间生成随机唯一ID
 */
export function getUUId () {
  const now = new Date()
  let month = now.getMonth() + 1
  let day = now.getDate()
  let hour = now.getHours()
  let minutes = now.getMinutes()
  let seconds = now.getSeconds()
  if (month > 0 && month < 10) {
    month = '0' + month
  }
  if (day > 0 && day < 10) {
    day = '0' + day
  }
  return now.getFullYear().toString() + month.toString() + day + hour + minutes + seconds + (Math.round(Math.random() * 1000 + 100)).toString()
}

export function arrGroupBy (array, fun) {
  const groups = {}
  array.forEach(function (o) {
    const group = fun(o)
    groups[group] = groups[group] || []
    groups[group].push(o)
  })
  let newArr = []
  Object.keys(groups).map(function (group, index) {
    newArr.push({
      id: index,
      name: group,
      children: groups[group]
    })
  })
  return newArr
}

/**
 * 获取当前时间
 */
export function getNowFormatDate () {
  var date = new Date()
  var seperator1 = "-"
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var strDate = date.getDate()
  if (month >= 1 && month <= 9) {
    month = "0" + month
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate
  return currentdate
}

/**
 * 根据传入日期增加时间
 * @param {*} date 
 * @param {*} days 
 */
export function addDate (date, days) {
  var d = new Date(date)
  d.setDate(d.getDate() + days)
  var month = d.getMonth() + 1
  var day = d.getDate()
  if (month < 10) {
    month = "0" + month
  }
  if (day < 10) {
    day = "0" + day
  }
  var val = d.getFullYear() + "-" + month + "-" + day
  return val
}

/**
 * 函数防抖
 * @param {*} fn 
 * @param {*} time 
 */
export function debounce (fn, time = 1000) {
  var timer;
  return function () {
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, arguments);
    }, time);
  }
}

/**
 * 函数节流,基于时间戳
 * @param {*} fn 
 * @param {*} time 
 */
export function throttle (fn, time = 1000) {
  let timestamp = 0;
  return function () {
    let now = Date.now()
    if (now - timestamp > time) {
      fn.apply(this, arguments)
      timestamp = now
    }
  }
}

export function flatten (ary) {
  return ary.reduce((pre, cur) => {
    return pre.concat(Array.isArray(cur.children) ? flatten(cur.children) : cur);
  })
}
