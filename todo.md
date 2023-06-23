My todo
- attempt to run current linking of AssistedGrouping with NLPDocTool
- probably have the hypothesis justification step occur outside of the loop at the end

Errors to resolve:
- when I try to setup my environment and do the pip installs, it uses the old pip
```bash
(venv) Jessica@31-35-134:server$ pip install Flask
bash: /Users/Jessica/MyOpenCodingRepo/server/venv/bin/pip: /Users/Jessica/OpenCodingForMachineLearning_InternshipVersion/server/venv/bin/: bad interpreter: No such file or directory
(venv) Jessica@31-35-134:server$ whereis pip
pip: /Users/Jessica/MyOpenCodingRepo/server/venv/bin/pip
```

- this came about because I was trying to fix this error:
```bash
Error: error:0308010C:digital envelope routines::unsupported
    at new Hash (node:internal/crypto/hash:69:19)
    at Object.createHash (node:crypto:138:10)
    at module.exports (/Users/Jessica/MyOpenCodingRepo/interface/node_modules/webpack/lib/util/createHash.js:135:53)
    at NormalModule._initBuildHash (/Users/Jessica/MyOpenCodingRepo/interface/node_modules/webpack/lib/NormalModule.js:417:16)
    at handleParseError (/Users/Jessica/MyOpenCodingRepo/interface/node_modules/webpack/lib/NormalModule.js:471:10)
    at /Users/Jessica/MyOpenCodingRepo/interface/node_modules/webpack/lib/NormalModule.js:503:5
    at /Users/Jessica/MyOpenCodingRepo/interface/node_modules/webpack/lib/NormalModule.js:358:12
    at /Users/Jessica/MyOpenCodingRepo/interface/node_modules/loader-runner/lib/LoaderRunner.js:373:3
    at iterateNormalLoaders (/Users/Jessica/MyOpenCodingRepo/interface/node_modules/loader-runner/lib/LoaderRunner.js:214:10)
    at iterateNormalLoaders (/Users/Jessica/MyOpenCodingRepo/interface/node_modules/loader-runner/lib/LoaderRunner.js:221:10)
/Users/Jessica/MyOpenCodingRepo/interface/node_modules/react-scripts/scripts/start.js:19
  throw err;
  ^

Error: error:0308010C:digital envelope routines::unsupported
    at new Hash (node:internal/crypto/hash:69:19)
    at Object.createHash (node:crypto:138:10)
    at module.exports (/Users/Jessica/MyOpenCodingRepo/interface/node_modules/webpack/lib/util/createHash.js:135:53)
    at NormalModule._initBuildHash (/Users/Jessica/MyOpenCodingRepo/interface/node_modules/webpack/lib/NormalModule.js:417:16)
    at /Users/Jessica/MyOpenCodingRepo/interface/node_modules/webpack/lib/NormalModule.js:452:10
    at /Users/Jessica/MyOpenCodingRepo/interface/node_modules/webpack/lib/NormalModule.js:323:13
    at /Users/Jessica/MyOpenCodingRepo/interface/node_modules/loader-runner/lib/LoaderRunner.js:367:11
    at /Users/Jessica/MyOpenCodingRepo/interface/node_modules/loader-runner/lib/LoaderRunner.js:233:18
    at context.callback (/Users/Jessica/MyOpenCodingRepo/interface/node_modules/loader-runner/lib/LoaderRunner.js:111:13)
    at /Users/Jessica/MyOpenCodingRepo/interface/node_modules/babel-loader/lib/index.js:59:103 {
  opensslErrorStack: [ 'error:03000086:digital envelope routines::initialization error' ],
  library: 'digital envelope routines',
  reason: 'unsupported',
  code: 'ERR_OSSL_EVP_UNSUPPORTED'
}
```
- which we figured was from not being able to use dropbox folders, but now its probably because the setup isn't working.