The current workflow for this application is as follows.

1. Make sure your model that you want to document is running. (i.e. `cd ./test_model && make run`)
2. Make sure we have a valid proxy to your model in `./interface/src/setupProxy.js`
- similarly, have your api links use the same prefix as me (`/user_model`)
- if you're running on localhost, make sure the port is correct.
For example, if I wanted to use port 6060 instead of 7070, I would change
```js
app.use('/user_model', createProxyMiddleware({target: 'http://localhost:6060', changeOrigin: true}));
```
to
```js
app.use('/user_model', createProxyMiddleware({target: 'http://localhost:7070', changeOrigin: true}));
```


3. Make sure the NLPDocTool backend is running by doing `cd ./NLPDocTool_Backend && ./doctoolbackend.sh`
If that doesn't work, make sure you have given ./doctoolbackend.sh execute permissions:
`cd ./NLPDocTool_Backend && chmod +x doctoolbackend.sh`
4. If open coding is currently running, do `./shutdown.sh`

**todo:** maybe test w/ and w/o the fix_unsupported_envelope thing because it hasn't seemed to be a problem anymore
5. Set up and run by doing: `bash fix_unsupported_envelope.txt && ./setup.sh && ./opencoding.sh` (ignore the warnings)
