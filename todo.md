My todo
- finish updating user model parameter saving and access from App state -> Model.js
- finish frontend call to `/user_model/predict`

Leftover todo:
- write out explanation for how user should finetune their model or finetune endpoint
(tell them that we are assuming they'll have pretrained it, 
i'm using a dummy pretrained model anyway)
-- if they should finetune their model on their own
---- => just note where the final open coding labels were stored so they can do that
-- if we will finetune for them 
---- => think how we want to pass batches of the results 
to the users app for processing
or if we'd want to send them all of the data at once
---- I think for this one, the most feasible thing would still be to just have 
the file path as well as the key/header names maybe.
be the thing we send in our http request to the user app backend 

Errors to resolve:

Resolved errors:
[X] deal with calling /processFile (404) from petrichor or translate it into our flask backend
    [X] i.e. try our NLPDocTool proxy (didn't work)
    - what did work was just copying the NLPDocTool backend to this repo and 
    having it run on port 3030