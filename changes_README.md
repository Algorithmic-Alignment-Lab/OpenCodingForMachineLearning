The current workflow for this application is as follows.

1. Make sure your model that you want to document is running. (i.e. `cd ./test_model && make run`)
2. Make sure we have a valid proxy to your model in `./interface/src/setupProxy.js`
- if you're running on localhost, make sure the port is correct.
For example, if I wanted to use port 6060 instead of 7777, I would change
```js
app.use('/user_model', createProxyMiddleware({target: 'http://localhost:5555', changeOrigin: true}));
```
to
```
app.use('/user_model', createProxyMiddleware({target: 'http://localhost:7777', changeOrigin: true}));
```

3. Make sure the NLPDocTool backend is running by doing `cd ./NLPDocTool_Backend && ./doctoolbackend.sh`
4. If open coding is currently running, do `./shutdown.sh`
5. Set up and run by doing: `./setup.sh && ./opencoding.sh` (ignore the warnings)
