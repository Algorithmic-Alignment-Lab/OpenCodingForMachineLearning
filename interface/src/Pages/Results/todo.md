- [ ] Continue trying to render summary page

    - [ ] investigate how to send the groups the user gave us from the app or the backend
    - [ ] consider different ways we want to 

    - so far I'm just working off https://mui.com/material-ui/react-table/#data-table

- [X] Fixed the following error by having DataTable only take in an argument called props and going from that.
Current error: 
```
Warning: Failed prop type: Invalid prop `columns` of type `object` supplied to `ForwardRef`, expected `array`.
    at http://localhost:3000/static/js/vendors~main.chunk.js:104180:15
    at DataTable
    at div
    at div
    at Results (http://localhost:3000/static/js/main.chunk.js:7980:5)
    at div
    at App (http://localhost:3000/static/js/main.chunk.js:212:5)
console.<computed> @ index.js:1
overrideMethod @ react_devtools_backend_compact.js:2367
printWarning @ react-jsx-dev-runtime.development.js:117
error @ react-jsx-dev-runtime.development.js:93
checkPropTypes @ react-jsx-dev-runtime.development.js:620
validatePropTypes @ react-jsx-dev-runtime.development.js:1072
jsxWithValidation @ react-jsx-dev-runtime.development.js:1192
DataTable @ DataTable.js:39
renderWithHooks @ react-dom.development.js:14985
mountIndeterminateComponent @ react-dom.development.js:17811
beginWork @ react-dom.development.js:19049
beginWork$1 @ react-dom.development.js:23940
performUnitOfWork @ react-dom.development.js:22776
workLoopSync @ react-dom.development.js:22707
renderRootSync @ react-dom.development.js:22670
performSyncWorkOnRoot @ react-dom.development.js:22293
(anonymous) @ react-dom.development.js:11327
unstable_runWithPriority @ scheduler.development.js:468
runWithPriority$1 @ react-dom.development.js:11276
flushSyncCallbackQueueImpl @ react-dom.development.js:11322
flushSyncCallbackQueue @ react-dom.development.js:11309
discreteUpdates$1 @ react-dom.development.js:22420
discreteUpdates @ react-dom.development.js:3756
dispatchDiscreteEvent @ react-dom.development.js:5889
index.js:1 Warning: Failed prop type: Invalid prop `rows` of type `object` supplied to `ForwardRef`, expected `array`.
    at http://localhost:3000/static/js/vendors~main.chunk.js:104180:15
    at DataTable
    at div
    at div
    at Results (http://localhost:3000/static/js/main.chunk.js:7980:5)
    at div
    at App (http://localhost:3000/static/js/main.chunk.js:212:5)
console.<computed> @ index.js:1
overrideMethod @ react_devtools_backend_compact.js:2367
printWarning @ react-jsx-dev-runtime.development.js:117
error @ react-jsx-dev-runtime.development.js:93
checkPropTypes @ react-jsx-dev-runtime.development.js:620
validatePropTypes @ react-jsx-dev-runtime.development.js:1072
jsxWithValidation @ react-jsx-dev-runtime.development.js:1192
DataTable @ DataTable.js:39
renderWithHooks @ react-dom.development.js:14985
mountIndeterminateComponent @ react-dom.development.js:17811
beginWork @ react-dom.development.js:19049
beginWork$1 @ react-dom.development.js:23940
performUnitOfWork @ react-dom.development.js:22776
workLoopSync @ react-dom.development.js:22707
renderRootSync @ react-dom.development.js:22670
performSyncWorkOnRoot @ react-dom.development.js:22293
(anonymous) @ react-dom.development.js:11327
unstable_runWithPriority @ scheduler.development.js:468
runWithPriority$1 @ react-dom.development.js:11276
flushSyncCallbackQueueImpl @ react-dom.development.js:11322
flushSyncCallbackQueue @ react-dom.development.js:11309
discreteUpdates$1 @ react-dom.development.js:22420
discreteUpdates @ react-dom.development.js:3756
dispatchDiscreteEvent @ react-dom.development.js:5889
index-esm.js:16 Uncaught TypeError: e.map is not a function
    at Ci (index-esm.js:16:1)
    at index-esm.js:16:1
    at invokePassiveEffectCreate (react-dom.development.js:23487:1)
    at HTMLUnknownElement.callCallback (react-dom.development.js:3945:1)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:3994:1)
    at invokeGuardedCallback (react-dom.development.js:4056:1)
    at flushPassiveEffectsImpl (react-dom.development.js:23574:1)
    at unstable_runWithPriority (scheduler.development.js:468:1)
    at runWithPriority$1 (react-dom.development.js:11276:1)
    at flushPassiveEffects (react-dom.development.js:23447:1)
    at performSyncWorkOnRoot (react-dom.development.js:22269:1)
    at react-dom.development.js:11327:1
    at unstable_runWithPriority (scheduler.development.js:468:1)
    at runWithPriority$1 (react-dom.development.js:11276:1)
    at flushSyncCallbackQueueImpl (react-dom.development.js:11322:1)
    at flushSyncCallbackQueue (react-dom.development.js:11309:1)
    at discreteUpdates$1 (react-dom.development.js:22420:1)
    at discreteUpdates (react-dom.development.js:3756:1)
    at dispatchDiscreteEvent (react-dom.development.js:5889:1)
Ci @ index-esm.js:16
(anonymous) @ index-esm.js:16
invokePassiveEffectCreate @ react-dom.development.js:23487
callCallback @ react-dom.development.js:3945
invokeGuardedCallbackDev @ react-dom.development.js:3994
invokeGuardedCallback @ react-dom.development.js:4056
flushPassiveEffectsImpl @ react-dom.development.js:23574
unstable_runWithPriority @ scheduler.development.js:468
runWithPriority$1 @ react-dom.development.js:11276
flushPassiveEffects @ react-dom.development.js:23447
performSyncWorkOnRoot @ react-dom.development.js:22269
(anonymous) @ react-dom.development.js:11327
unstable_runWithPriority @ scheduler.development.js:468
runWithPriority$1 @ react-dom.development.js:11276
flushSyncCallbackQueueImpl @ react-dom.development.js:11322
flushSyncCallbackQueue @ react-dom.development.js:11309
discreteUpdates$1 @ react-dom.development.js:22420
discreteUpdates @ react-dom.development.js:3756
dispatchDiscreteEvent @ react-dom.development.js:5889
index-esm.js:16 Uncaught TypeError: e.forEach is not a function
    at _i (index-esm.js:16:1)
    at index-esm.js:16:1
    at index-esm.js:1:1
    at index-esm.js:16:1
    at invokePassiveEffectCreate (react-dom.development.js:23487:1)
    at HTMLUnknownElement.callCallback (react-dom.development.js:3945:1)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:3994:1)
    at invokeGuardedCallback (react-dom.development.js:4056:1)
    at flushPassiveEffectsImpl (react-dom.development.js:23574:1)
    at unstable_runWithPriority (scheduler.development.js:468:1)
    at runWithPriority$1 (react-dom.development.js:11276:1)
    at flushPassiveEffects (react-dom.development.js:23447:1)
    at performSyncWorkOnRoot (react-dom.development.js:22269:1)
    at react-dom.development.js:11327:1
    at unstable_runWithPriority (scheduler.development.js:468:1)
    at runWithPriority$1 (react-dom.development.js:11276:1)
    at flushSyncCallbackQueueImpl (react-dom.development.js:11322:1)
    at flushSyncCallbackQueue (react-dom.development.js:11309:1)
    at discreteUpdates$1 (react-dom.development.js:22420:1)
    at discreteUpdates (react-dom.development.js:3756:1)
    at dispatchDiscreteEvent (react-dom.development.js:5889:1)
_i @ index-esm.js:16
(anonymous) @ index-esm.js:16
(anonymous) @ index-esm.js:1
(anonymous) @ index-esm.js:16
invokePassiveEffectCreate @ react-dom.development.js:23487
callCallback @ react-dom.development.js:3945
invokeGuardedCallbackDev @ react-dom.development.js:3994
invokeGuardedCallback @ react-dom.development.js:4056
flushPassiveEffectsImpl @ react-dom.development.js:23574
unstable_runWithPriority @ scheduler.development.js:468
runWithPriority$1 @ react-dom.development.js:11276
flushPassiveEffects @ react-dom.development.js:23447
performSyncWorkOnRoot @ react-dom.development.js:22269
(anonymous) @ react-dom.development.js:11327
unstable_runWithPriority @ scheduler.development.js:468
runWithPriority$1 @ react-dom.development.js:11276
flushSyncCallbackQueueImpl @ react-dom.development.js:11322
flushSyncCallbackQueue @ react-dom.development.js:11309
discreteUpdates$1 @ react-dom.development.js:22420
discreteUpdates @ react-dom.development.js:3756
dispatchDiscreteEvent @ react-dom.development.js:5889
2index.js:1 The above error occurred in the <ForwardRef> component:

    at http://localhost:3000/static/js/vendors~main.chunk.js:104180:15
    at div
    at DataTable
    at div
    at div
    at Results (http://localhost:3000/static/js/main.chunk.js:7980:5)
    at div
    at App (http://localhost:3000/static/js/main.chunk.js:212:5)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
console.<computed> @ index.js:1
overrideMethod @ react_devtools_backend_compact.js:2367
logCapturedError @ react-dom.development.js:20085
update.callback @ react-dom.development.js:20118
callCallback @ react-dom.development.js:12318
commitUpdateQueue @ react-dom.development.js:12339
commitLifeCycles @ react-dom.development.js:20736
commitLayoutEffects @ react-dom.development.js:23426
callCallback @ react-dom.development.js:3945
invokeGuardedCallbackDev @ react-dom.development.js:3994
invokeGuardedCallback @ react-dom.development.js:4056
commitRootImpl @ react-dom.development.js:23151
unstable_runWithPriority @ scheduler.development.js:468
runWithPriority$1 @ react-dom.development.js:11276
commitRoot @ react-dom.development.js:22990
performSyncWorkOnRoot @ react-dom.development.js:22329
(anonymous) @ react-dom.development.js:11327
unstable_runWithPriority @ scheduler.development.js:468
runWithPriority$1 @ react-dom.development.js:11276
flushSyncCallbackQueueImpl @ react-dom.development.js:11322
flushSyncCallbackQueue @ react-dom.development.js:11309
discreteUpdates$1 @ react-dom.development.js:22420
discreteUpdates @ react-dom.development.js:3756
dispatchDiscreteEvent @ react-dom.development.js:5889
index-esm.js:16 Uncaught TypeError: e.map is not a function
    at Ci (index-esm.js:16:1)
    at index-esm.js:16:1
    at invokePassiveEffectCreate (react-dom.development.js:23487:1)
    at HTMLUnknownElement.callCallback (react-dom.development.js:3945:1)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:3994:1)
    at invokeGuardedCallback (react-dom.development.js:4056:1)
    at flushPassiveEffectsImpl (react-dom.development.js:23574:1)
    at unstable_runWithPriority (scheduler.development.js:468:1)
    at runWithPriority$1 (react-dom.development.js:11276:1)
    at flushPassiveEffects (react-dom.development.js:23447:1)
    at performSyncWorkOnRoot (react-dom.development.js:22269:1)
    at react-dom.development.js:11327:1
    at unstable_runWithPriority (scheduler.development.js:468:1)
    at runWithPriority$1 (react-dom.development.js:11276:1)
    at flushSyncCallbackQueueImpl (react-dom.development.js:11322:1)
    at flushSyncCallbackQueue (react-dom.development.js:11309:1)
    at discreteUpdates$1 (react-dom.development.js:22420:1)
    at discreteUpdates (react-dom.development.js:3756:1)
    at dispatchDiscreteEvent (react-dom.development.js:5889:1)
```