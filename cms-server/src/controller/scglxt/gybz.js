
/**
 * 加工工艺操作的接口
 */
const Base = require('../base.js');
let gyModel = 'scglxt_t_gygc_bz'
module.exports = class extends Base {
    
    //获取标准列表
    async getGyBzListAction(){
        let data = await this.model('scglxt_t_gybz').select()
        return this.success(data)
    }

    async getGyByBzIdAction() {
        let bzid = this.get('bzid')
        let data = await this.model(gyModel).where({ssbz: bzid}).join({ table: 'scglxt_t_sblx', as: 'sblx',  join: 'left', on: ['sbid', 'id'] }).join({ table: 'scglxt_t_jggy', as: 'jggy',  join: 'left', on: ['gynr', 'id'] }).order('serial asc').field('scglxt_t_gygc_bz.* ,jggy.gymc, sblx.mc sbmc').select()
        return this.success(data)
    }
    
    /**
     * 保存工艺
     * 1.
     * @returns 
     */
    async addGyBzManyAction(){
        let form = this.post('form')
        try{
            let whereObj = {
                ssbz: form[0].ssbz
            }
            let rows = await this.model(gyModel).where(whereObj).select()

            let deleteRow = await this.model(gyModel).where(whereObj).delete()

            let data =  await this.model(gyModel).addMany(form,{pk: 'ID'});
            return this.success(data)
        }catch(ex){
            let data =  await this.model(gyModel).addMany(rows,{pk: 'ID'});
            
            return this.fail(ex)
        }
    }
    //删除工艺标准
    async deleteGyBzByIdAction(){
        let id = this.post('id')
        try{
            let affectedRows = await this.model(gyModel).where({bzid: id}).delete();
            let data = await this.model('scglxt_t_gybz').where({id: id}).delete();

            return this.success(data)
        }catch(ex){
            return this.fail(ex)
        }
    }

};