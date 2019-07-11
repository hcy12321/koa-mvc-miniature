/**
 * 控制器管理
 * hcy12321 2019.4.29
 */
const Config = require('../config');
const fs = require('mz/fs');
const logMgr = require('./log_manager');

module.exports = new class ControllerManager {
    constructor() {
        this.controllerMap = new Map();
        this.logger = null;
        this.router = null;
        this.routerFunc = null;
        this.dir = '';
    }

    setRouter(router) {
        this.router = router;
    }

    setRouterFunc(func) {
        this.routerFunc = func;
    }

    async init(dir) {
        dir = dir || this.dir;
        this.dir = dir;
        this.logger = await logMgr.getLogger('server');
        this.controllerMap = new Map();
        let files = await fs.readdir(dir);
        files = files.filter(f => f.endsWith('.js')) ;
        for (let f of files ){
            await this.initFile(dir, f);
        }
    }

    async initFile(dir, f) {
        this.logger.log(`process controller: ${f}`);
        let filePath = `${dir}/${f}`;
        delete require.cache[require.resolve(filePath)];
        let c = require(filePath);
        let controller = new c();
        await controller.init();
        this.controllerMap.set(c.name, controller);
        controller.router = this.router;
        let self = this;
        if (c.name === Config.defaultControllerName) {
            this.router.get(`/`, async (ctx, next) => {
                self.logger.debug(`root process get url ${ctx.originalUrl}`);
                await self.routerFunc(ctx, next, controller);
            });
            this.router.post(`/`, async (ctx, next) => {
                self.logger.debug(`root process post url ${ctx.originalUrl}`);
                await self.routerFunc(ctx, next, controller);
            });
        }
        this.router.get(`/${c.name}/:name`, async (ctx, next) => {
            self.logger.debug(`process get url ${ctx.originalUrl}`);
            await self.routerFunc(ctx, next, controller);
        });
        this.router.post(`/${c.name}/:name`, async (ctx, next) => {
            self.logger.debug(`process post url ${ctx.originalUrl}`);
            await self.routerFunc(ctx, next, controller);
        });
    }

    set(name, obj) {
        this.controllerMap.set(name, obj);
    }

    get(name) {
        return this.controllerMap.get(name);
    }

    has(name) {
        return this.controllerMap.has(name);
    }

    del(name) {
        return this.controllerMap.delete(name);
    }

    forEach(func) {
        return this.controllerMap.forEach(func);
    }
};