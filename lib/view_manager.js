const nunjucks = require('nunjucks');


module.exports = new class ViewManager {

    constructor() {
        this.env = null;
    }

    get() {
        return this.env;
    }

    createEnv(path, opts) {
        let
            autoescape = opts.autoescape === undefined ? true : opts.autoescape,
            noCache = opts.noCache || false,
            watch = opts.watch || false,
            throwOnUndefined = opts.throwOnUndefined || false,
            env = new nunjucks.Environment(
                new nunjucks.FileSystemLoader(path, {
                    noCache: noCache,
                    watch: watch,
                }), {
                    autoescape: autoescape,
                    throwOnUndefined: throwOnUndefined
                });
        if (opts.filters) {
            for (let f in opts.filters) {
                env.addFilter(f, opts.filters[f]);
            }
        }
        this.env = env;
        return env;
    }
};