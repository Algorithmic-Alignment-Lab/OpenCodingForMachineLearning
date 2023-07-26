const createProxyMiddleware = require('http-proxy-middleware');
module.exports = function(app) {
    app.use('/user_model', createProxyMiddleware({target: 'http://localhost:5555', changeOrigin: true}));
    // app.use('/api', createProxyMiddleware({target: 'http://localhost:8000'}));
    // ^ this was unnecessary because we already set the default proxy to this in package.json
    // also, we weren't even calling it correctly, 
    // since we didn't change any of open coding's backend links to api...

    // below is the beginning of what I'm considering to temporarily link this application
    // to NLPDocTool's backend. 
    // Ideally, I'd be converting her express backend to flask, but alas, time...
    app.use('/NLPDocTool/api', createProxyMiddleware({target: 'http://localhost:3030/', changeOrigin: true}));
}