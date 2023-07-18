const proxy=require('http-proxy-middleware');
module.exports = function(app) {
    // note: cannot set proxy to "/" because that reroutes openCoding home page
    // when i try to remove the proxy from package.json, the whole page doesn't load
    app.use(proxy('/api',{target:'http://localhost:8000'})),
    // todo: see how to do this on the fly (after user enters their url)
    app.use(proxy('/user_model',{target:'http://localhost:5555'}))
}