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
        - My current understanding is that the users will be interacting with.
    - // note to self, we'll train the model to be documented (which is separate) with the same labeled data in both experimental conditions.
    - 

- What we want to do in development (will do so on a different branch so I can leave all this alone)
    - have openCoding be back to right before NLPDocTool

- [X] **todo**: remove the verification step because we aren't interested in the extrapolated labels
- [ ] **todo:** update the results slide to summarize the codes and groups the user provides
    - [ ] figure out how to get all / several of the groups from the database (what backend method to call)
- i.e. show one code from each group to remind the user about the trends they've seen in the data. 
- [ ] **todo:** also note whatever other potential layouts we believe will be good for displaying the results of their coding.

- since we only care about the user interacting with the data, maybe we can remove steps that ask the user to select a model? 

- consolidate getView and states to update pages vs Routing (make consistent.)

instead of having docGeneration deal with the model, we can leave that in openCoding verification
Then, we can try to just pass over the particular texts that the user hypothesized to the verification stage 

Errors to resolve:
