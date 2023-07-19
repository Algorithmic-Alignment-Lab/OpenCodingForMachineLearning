const createProxyMiddleware = require('http-proxy-middleware');
module.exports = function(app) {
    app.use('/user_model', createProxyMiddleware({target: 'http://localhost:5555', changeOrigin: true}));
    app.use('/api', createProxyMiddleware({target: 'http://localhost:8000'}));
}