const BASE_URL = process.env.NODE_ENV === 'development' ?
'http://127.0.0.1:8089/scpc/' :
'http://192.168.1.205:8000/scpc/'

export var EXPORT_DDBOM = BASE_URL +  'ddInfo_exportData.action'

export var EXPORT_DDBL = BASE_URL + 'bomInfo_exportBLData.action'