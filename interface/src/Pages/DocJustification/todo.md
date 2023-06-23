My todos from the js file are pasted here.
When complete, remember to cross off in both places!

- fix blog imports
```bash
TypeScript error in /Users/Jessica/OpenCodingForMachineLearning_InternshipVersion/interface/src/blog/Blog.tsx(15,19):
Cannot find module './blog-post.1.md' or its corresponding type declarations.  TS2307

    13 | import Sidebar from './Sidebar';
    14 | import Footer from './Footer';
  > 15 | import post1 from './blog-post.1.md';
```
    - Check with the imports and try to trace back and see if they are actually needed

- consider if we want to skip this step (4) 
and just go right to the annotator generating hypotheses

- link this page to AssistedGrouping

- add the next 2 steps of NLPDocTool to this branch and connect the pages.

- figure out how the model plays into this step, and how to pass openCodingModel instead
- in justicication text field box: return here when resolved model issue
    - this is temporarily commented out 
```js
Model.contextJustification = event.target.value
```
    so comeback when we've sorted out the business with the model.
    - same with the state's use of the model, commented out for now but will come back to it