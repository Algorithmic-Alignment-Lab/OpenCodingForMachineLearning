My todo
- Now that we clarified with Dylan what we are actually doing, here is a note about how I'll do those changes in another branch:
/* what I thought we wanted to do (as you can see by the current page ordering in this branch) is obtain training data and documentation at the same time.
*/
- What we actually want to do with our experiment: 
- our conditions: 
    - control group: unstructured interaction with the data
    - experimental group: structured interaction with the data using open coding
        - have openCoding be a tool for developers/ to interact with the unlabeled texts
    - clarifying questions: *Are we trying to say they are interacting with the model or that they are interacting with the prompts?* 
        - My current understanding is that the users will be interacting with the data.
    - // note to self, *still need to clarify* if we'll train the model to be documented (which is separate) with the same labeled data in both experimental conditions.
    - 

- What we want to do in development
    - consider how we will deal with the NLPDocTool backend methods.
    - add call to /user_model/predict

Errors to resolve:
- deal with calling /processFile (404) from petrichor or translate it into our flask backend
    - i.e. try our NLPDocTool proxy