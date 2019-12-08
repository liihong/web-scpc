
let api = {
    // 首页统计
    getStatistics: 'scglxt/statistics',
    
    getSblxPc: 'scglxt/statistics/getSblxPc',
    getGygxPc: 'scglxt/statistics/getGygxPc',
    getGygsPc: 'scglxt/statistics/getGygsPc',
    getDDWorkSpeed: 'scglxt/statistics/getDDWorkSpeed',//获取订单动态工时
    getPeopleHour: 'scglxt/statistics/getPeopleHour', //工人工时统计
    
    //数据字典操作
    getSjzdById: 'scglxt/sjzd/getSjzdById',
    getBzList: 'scglxt/sjzd/getBzList',
    getPeopleByBz: 'scglxt/sjzd/getPeopleByBz',
    getSBLXList:'scglxt/sjzd/getSBLXList',

    //工艺工序操作
    getJggyList: 'scglxt/gygx/getJggyList',
    getJggxByBOMId: 'scglxt/gygx/getJggxByBOMId',
    getSblxList: 'scglxt/gygx/getSblxList',
    getSbList: 'scglxt/gygx/getSbList',
    saveGygxInfo: 'scglxt/gygx/saveGygxInfo',
    deleteGygx: 'scglxt/gygx/deleteGygx',
    // 报价单
    addBjd: 'scglxt/bjd/addBjd',

    //订单操作
    getDdDetail: 'scglxt/ddgl/getDdDetail',
    getDdTz: 'scglxt/ddgl/getDdTz',
    copyDd: 'scglxt/ddgl/copyDd',
    deleteDd: 'scglxt/ddgl/deleteDd',
    
    exportDdByZj: '/api/scglxt/ddgl/exportDdByZj',
    exportDdBOM: '/api/scglxt/ddgl/exportDdBOM',
    exportGRGSTJ: '/api/scglxt/ddgl/exportGRGSTJ',

    getNewDDbh: 'scglxt/ddgl/getNewDDbh',
    getDdListByWhere: 'scglxt/ddgl/getDdListByWhere',
    getWorkingDDList: 'scglxt/ddgl/getWorkingDDList',
    uploadDrawing: '/api/scglxt/ddgl/uploadDrawing',
    deleteDdTz: 'scglxt/ddgl/deleteDdTz',
    
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
    
    //组件操作
    addZj: 'scglxt/zj/addZj',
    editZj: 'scglxt/zj/editZj',
    copyZjById: 'scglxt/zj/copyZjById',
    getBzjByZjId: 'scglxt/zj/getBzjByZjId',
    deleteZjById: 'scglxt/zj/deleteZjById',
    getZJTreeList: 'scglxt/zj/getZJTreeList',
    getZJListBySSDd: 'scglxt/zj/getZJListBySSDd',
    
    //工艺流程标准管理
    getGyByBzId: 'scglxt/gybz/getGyByBzId',
    addGyBzMany: 'scglxt/gybz/addGyBzMany',
    getGyBzList: 'scglxt/gybz/getGyBzList',

    beginWork: 'scglxt/gygx/beginWork',
    overWork: 'scglxt/gygx/overWork',
    getCheckList: 'scglxt/gygx/getCheckList',// 获取检验列表
    gygxCheckPassAll: 'scglxt/gygx/gygxCheckPassAll',
    gygxCheckPassPart: 'scglxt/gygx/gygxCheckPassPart',
    gygxCheckNoPass: 'scglxt/gygx/gygxCheckNoPass'
    
  }
  export default api