
let api = {
    // 首页统计
    getStatistics: 'scglxt/statistics',
    
    getSblxPc: 'scglxt/statistics/getSblxPc',
    getGygxPc: 'scglxt/statistics/getGygxPc',
    getGygsPc: 'scglxt/statistics/getGygsPc',
    getDDWorkSpeed: 'scglxt/statistics/getDDWorkSpeed',//获取订单动态工时
    getPeopleHour: 'scglxt/statistics/getPeopleHour', //工人工时统计
    exportPersonalStat: 'scglxt/statistics/exportPersonalStat', //导出工人工时统计
    getPersonalDay: 'scglxt/statistics/getPersonalDay',
    getPersonalMonth: 'scglxt/statistics/getPersonalMonth',
    getSygsList: 'scglxt/gygx/getSygsList', //某一工艺剩余工时
    getAdminStat: 'scglxt/statistics/getAdminStat',
    //数据字典操作
    getSjzdById: 'scglxt/sjzd/getSjzdById',
    getBzList: 'scglxt/sjzd/getBzList',
    getPeopleByBz: 'scglxt/sjzd/getPeopleByBz',
    getSBLXList:'scglxt/sjzd/getSBLXList',
    updateSblxInfo: 'scglxt/sjzd/updateSblxInfo',
    getAllWxCj: 'scglxt/sjzd/getAllWxCj',

    //工艺工序操作
    getJggyList: 'scglxt/gygx/getJggyList',
    getJggxByBOMId: 'scglxt/gygx/getJggxByBOMId',
    getSblxList: 'scglxt/gygx/getSblxList',
    getSbList: 'scglxt/gygx/getSbList',
    saveGygxInfo: 'scglxt/gygx/saveGygxInfo',
    deleteGygx: 'scglxt/gygx/deleteGygx',
    orderTop: 'scglxt/gygx/orderTop',
    // 报价单
    addBjd: 'scglxt/bjd/addBjd',
    ht_sptg: 'scglxt/bjd/ht_sptg',
    getHtSpyy: 'scglxt/bjd/getHtSpyy',
    //订单操作
    getOrderList: 'scglxt/ddgl/getOrderList',
    getDdDetail: 'scglxt/ddgl/getDdDetail',
    getDdTz: 'scglxt/ddgl/getDdTz',
    copyDd: 'scglxt/ddgl/copyDd',
    deleteDd: 'scglxt/ddgl/deleteDd',
    
    exportDdByZj: '/api/scglxt/ddgl/exportDdByZj',
    exportDdBOM: '/api/scglxt/ddgl/exportDdBOM',
    exportDdBL: '/api/scglxt/ddgl/exportDdBL',
    exportGRGSTJ: '/api/scglxt/ddgl/exportGRGSTJ',

    getNewDDbh: 'scglxt/ddgl/getNewDDbh',
    getDdListByWhere: 'scglxt/ddgl/getDdListByWhere',
    getWorkingDDList: 'scglxt/ddgl/getWorkingDDList',
    uploadDrawing: '/api/scglxt/ddgl/uploadDrawing',
    deleteDdTz: 'scglxt/ddgl/deleteDdTz',
    updateEndTime: 'scglxt/ddgl/updateEndTime',
    getDDKhxxById:'scglxt/ddgl/getDDKhxxById',
    updateAllDdBLZT: 'scglxt/ddgl/updateAllDdBLZT',//修改订单所有零件备料状态
    setDDWorkData: 'scglxt/ddgl/setDDWorkData', // 定制实时看板的订单信息
    getCustomDDWorkData: 'scglxt/ddgl/getCustomDDWorkData', //获取定制的订单信息
    setDdOrderData: 'scglxt/ddgl/setDdOrderData',// 订单排序
    
    //获取订单BOM信息
    getDdBOMData: 'scglxt/ddgl/getDdBOMData',
    getDdMark:'scglxt/ddgl/getDdMark',
    setDdMark: 'scglxt/ddgl/setDdMark',
    
    //bom表操作
    addBomData: 'scglxt/bom/addBom',
    addBomMany: 'scglxt/bom/addBomMany',
    editBomData: 'scglxt/bom/editBom',
    copyBomData: 'scglxt/bom/copyBom',
    deleteBOM: 'scglxt/bom/deleteBOM',
    updateBLZT: 'scglxt/bom/updateBLZT',
    getBLlist: 'scglxt/bom/getBLlist',
    getZjByBomId: 'scglxt/bom/getZjByBomId',
    getGYgslist: 'scglxt/bom/getGYgslist',
    BOMFinallyCheck: 'scglxt/bom/BOMFinallyCheck',//终检
    BOMInStore: 'scglxt/bom/BOMInStore',//入库
    BOMOutStore: 'scglxt/bom/BOMOutStore',//出库
    BOMSpeedProgress: 'scglxt/bom/BOMSpeedProgress',//进度跟踪
    BOMInSpareStock: 'scglxt/bom/BOMInSpareStock',//成品转入备用库存
    uploadBOMEndTime: 'scglxt/bom/uploadBOMEndTime',
    getBOMBykc:'scglxt/bom/getBOMBykc', //获取BOM备用库存
    setBOMBykc:'scglxt/bom/setBOMBykc',//关联备用库存
    stopBOMProcess: 'scglxt/bom/stopBOMProcess',
    getBykcList: 'scglxt/bom/getBykcList',
    getGyByBzBomMC: 'scglxt/bom/getGyByBzBomMC',
    getInfoByBomMc: 'scglxt/bom/getInfoByBomMc',
    
    //组件操作
    addZj: 'scglxt/zj/addZj',
    editZj: 'scglxt/zj/editZj',
    copyZjById: 'scglxt/zj/copyZjById',
    getBzjByZjId: 'scglxt/zj/getBzjByZjId',
    deleteZjById: 'scglxt/zj/deleteZjById',
    getZJTreeList: 'scglxt/zj/getZJTreeList',
    getZJListBySSDd: 'scglxt/zj/getZJListBySSDd',
    bzj:{
      getBzjKCByName:'scglxt/bzj/getBzjKCByName',//根据零件名称获取标准件库存
      inStoreBzj:'scglxt/bzj/inStoreBzj', //标准件入库
      outStoreBzj:'scglxt/bzj/outStoreBzj'
    },
    
    //工艺流程标准管理
    getGyByBzId: 'scglxt/gybz/getGyByBzId',
    addGyBzMany: 'scglxt/gybz/addGyBzMany',
    getGyBzList: 'scglxt/gybz/getGyBzList',
    addBzGyByBomId: 'scglxt/gybz/addBzGyByBomId',

    beginWork: 'scglxt/gygx/beginWork',
    overWork: 'scglxt/gygx/overWork',
    getCheckList: 'scglxt/gygx/getCheckList',// 获取检验列表
    gygxCheckPassAll: 'scglxt/gygx/gygxCheckPassAll',
    gygxCheckPassPart: 'scglxt/gygx/gygxCheckPassPart',
    gygxCheckNoPass: 'scglxt/gygx/gygxCheckNoPass',
    gygxCheckRBJS: 'scglxt/gygx/gygxCheckRBJS',//质检让步接收
    sureManualScrap: 'scglxt/gygx/sureManualScrap',//手工增加报废流程
    sureManualScrapCL: 'scglxt/gygx/sureManualScrapCL',// 材料报废
    sureManualScrapJS: 'scglxt/gygx/sureManualScrapJS',// 技术报废

    //人工修改加工记录
    updateJGJL: 'scglxt/gygx/updateJGJL',
    deleteJGJL: 'scglxt/gygx/deleteJGJL'
  }
  export default api