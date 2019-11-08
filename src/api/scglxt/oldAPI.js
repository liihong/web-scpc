const BASE_URL = process.env.NODE_ENV === 'development' ?
'http://127.0.0.1:8089/scpc/' :
'http://223.72.116.249:8000/'

export var EXPORT_DDBOM = BASE_URL +  'ddInfo_exportData.action'

export var EXPORT_DDBL = BASE_URL + 'bomInfo_exportBLData.action'