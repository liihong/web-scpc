
/**
 * 组件操作的接口
 */
const Base = require('../base.js');
let zjModel = 'scglxt_t_zj'
module.exports = class extends Base {

    /**
     * 添加组件，添加组件的同时，让组件和标准件的关系也保存起来，方便回填
     */
    async addZjAction(){
        try{
            let form = this.post('form')
            let bzj = this.post('bzj')
            let jgj = this.post('jgj')
            
            let data =  await this.model(zjModel).add(form);
            if(bzj.length > 0) {
                let bzjData = await this.model('scglxt_t_bzj_zj').addMany(bzj,{pk: 'ID'});
            }
            if(jgj.length > 0){
                let jgjData = await this.model('scglxt_t_bom_zj').addMany(jgj,{pk: 'ID'});
            }
            
            return this.success(data)
        }catch(ex){
            return this.fail(ex)
        }
    }
    //编辑组件，先删除标准件关系，再重新根据参数添加
    async editZjAction() {
        try{
            let form = this.post('form')
            let bzj = this.post('bzj')
            let jgj = this.post('jgj')
            let primaryKey = this.post('primaryKey')
            
            let deleteRow = await this.model('scglxt_t_bzj_zj').where({zjid: primaryKey.id}).delete()
            let deleteRow2 = await this.model('scglxt_t_bom_zj').where({zjid: primaryKey.id}).delete()

            let bzjData = await this.model('scglxt_t_bzj_zj').addMany(bzj,{pk: 'ID'});
            
            let jgjData = await this.model('scglxt_t_bom_zj').addMany(jgj,{pk: 'ID'});
            
            let data =  await this.model(zjModel).where(primaryKey).update(form)
           
            return this.success(data)
        }catch(ex){
            return this.fail(ex)
        }
    }

    async getBzjByZjIdAction() {
        try{
            let Id = this.get('id')
            let zjData =  await this.model(zjModel).where({id: Id}).find()
            let data = await this.model('scglxt_t_bzj_zj').where({zjid: Id}).field('id,zjmc,zjid,bzjmc,bzjid,bzjsl,bz').select()
            let jgjData =  await this.model('scglxt_t_bom_zj').where({zjid: Id}).field('id,zjmc,zjid,zjsl,bomid').select()
            zjData.bzj = data
            zjData.jgj = jgjData
            
            return this.success(zjData)
         }catch(ex){
            return this.fail(ex)
        }
    }

    //通过组件ID删除相应数据
    async deleteZjByIdAction(){
        let Id = this.post('id')

        let bom = await this.model('scglxt_t_bom_zj').where({zjid: Id}).delete()
        let bzj = await this.model('scglxt_t_bzj_zj').where({zjid: Id}).delete()

        let data = await this.model(zjModel).where({id: Id}).delete()

        return this.success(data)
    }
};