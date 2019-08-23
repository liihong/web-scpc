import _ from 'lodash';
let format = {}
import router from '@/router'
/**
 * 格式化菜单数据为路由格式
 * @param menuData
 * @returns {Array}
 */
format.menuRouterData = function (menuData) {
    let routers = router.options.routes
    let menuRouter = []
    // 提取出父目录
    let parentArr = menuData.filter((doc) => {
        return doc.parentId == '0'
    });
    // 提取出子菜单
    let childArr = menuData.filter((doc) => {
        return doc.parentId != '0'
    });
    parentArr.map((item, i) => {
        let routerObj = {
            path: item.resKey,
            meta: {
                title: item.resName,
                icon: item.icon
            },
            name: item.resKey,
            children: [],
            component: () =>
                import ('@/views/layout/Layout.vue')
        }
        if (i == 0) {
            router.addRoutes([{
                path: '/',
                redirect: '/' + childArr[0].resKey,
                component: () =>
                    import ('@/views/layout/Layout.vue'),
                children: [{
                    path: childArr[0].resKey,
                    meta: {
                        title: childArr[0].resName,
                        icon: childArr[0].icon
                    },
                    hidden: true,
                    name: childArr[0].resKey,
                    component: () =>
                        import (`@/views/${childArr[0].path}`)
                }]

            }])
        }
        childArr.forEach(child => {
            if (item.resId == child.parentId) {
                routerObj.children.push({
                    path: '/' + child.resKey,
                    meta: {
                        title: child.resName,
                        icon: child.icon
                    },
                    name: child.resKey,
                    component: () =>
                        import (`@/views/${child.path}`)
                })
            }
        })
        menuRouter.push(routerObj)
    })
    return menuRouter
}
export function renderTreeData(result) {
    let newResult = result;
    let treeData = newResult.docs;
    let childArr = _.filter(treeData, (doc) => {
        return doc.parentId != '0'
    });

    for (let i = 0; i < childArr.length; i++) {
        let child = childArr[i];
        for (let j = 0; j < treeData.length; j++) {
            let treeItem = treeData[j];
            if (treeItem._id == child.parentId || treeItem.id == child.parentId) {
                if (!treeItem.children) treeItem.children = [];
                treeItem.children.push(child);
                break;
            }
        }
    }

    newResult.docs = _.filter(treeData, (doc) => {
        return doc.parentId == '0'
    });
    return newResult;
}
export default format