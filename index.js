const Config = require('./config');
const logMgr = require('./lib/log_manager');
const Koa = require('koa');
const router = require('koa-router')();
const path = require('path');
const koaStatic = require('koa-static');
const bodyParser = require('koa-bodyparser');
const controllerMgr = require('./lib/controller_manager');
const viewMgr = require('./lib/view_manager');
const dataMgr = require('./lib/data_manager');

async function main() {
    const app = new Koa();
    await dataMgr.init();
    const logger = await logMgr.getLogger('server');
    viewMgr.createEnv(path.join(__dirname, 'views'), {
        watch: true
    });

    let routerFunc = async (ctx, next, controller) => {
        try {
            if (!ctx.params.name) ctx.params.name = Config.defaultFuncName;
            if (ctx.params.name[0] !== '_' && controller[ctx.params.name]) {
                let ret = controller[ctx.params.name](ctx);
                if (ret instanceof Promise) ret = await ret;
                if (ret) ctx.response.body = ret;
            }
        } catch(e) {
            logger.error(`get process err: ${e.stack}`);
        }
        await next();
    }
    let dir = path.join(__dirname, 'controllers');
    controllerMgr.setRouter(router);
    controllerMgr.setRouterFunc(routerFunc);
    await controllerMgr.init(dir);

    app.use(bodyParser());
    app.use(koaStatic(path.join(__dirname, 'static')));
    app.use(router.routes());
    
    const port = Config.port || 3000;
    app.listen(port);
    logger.info(`server start at http://127.0.0.1:${port}/`);
}

main();