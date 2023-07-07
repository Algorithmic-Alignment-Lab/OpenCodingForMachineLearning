- [X] Continue trying to render summary page

7/5
- [X] Reintroduce loop where they can go back and code more if they don't like what they see here in the results


7/6
- [ ] Fix buttons rendering side by side


get_results places the final labels in a csv file,
so we can add a method to read from there in the backend 
for us to call.

Data passing

- [X] investigate how to send the groups the user gave us from the app or the backend
--> Learned that getLabels from App.js
    just gets the groups from AssistedGrouping
- So, so far we know how to get the annotations and the groups.
    - how to retrieve the annotations the user provided
    --> getDataWithParams(/data/get_annotations)
    comes with format `[{id: _ , text: _ , annotation: _}...]`
    - how to get the groups the user provided
    --> pass in the getLabels() from App.js then call it from props
    (since AssistedGrouping saves the groups there 
    by using saveLabelState)
        groups returned by getLabels is in the format: 
        `[{id: _, true_label: ${group}, predicted_label: null}, ...]`
    - [ ] TODO: possibly delete involving the groups in the results?
        - Reasoning: the model does not use them,
        after the user groups them, 
        all that is left is the new set of labels, 
        which do not have corresponding groups.
    
- [X] Have the model predict the rest of the labels 
--> getDataWithParams(/data/get_results)
- problem: takes a long time to finetune the model
    - Taylor and I talked about it 7/6 and we think 
    that finetuning is no longer necessary
    
- [ ] Remove finetuning to speed up get_results
    // see /data/get_results in open_coding.py 

- [ ] Add backend method to pull the resulting labels for us.


After we manage to pass in the groups and understand how to match the ids up...
- [ ] Add functions to calculate and display statistics about the users codes
    // move away from just displaying all the users codes, or maybe we could have this be a popup
    - number of annotations per group
    - percentage of annotations with each group

- [ ] consider different ways we want to format the component
    so far I'm just working off https://mui.com/material-ui/react-table/#data-table

    **If time permits**: (since this led me down a rabbit hole)
        - [ ] maybe have adjustable width for the table text and annotation columns
        - [ ] set text to wrap around 
        // or allow them to scroll throw a cell.
        // I feel like the former is easier.
        - attempted with div css text wrapping and Typographys which supposedly automatically wrap text

        Note: as I fiddle with mui, I get this warning
        ```Warning: findDOMNode is deprecated in StrictMode. findDOMNode was passed an instance of Transition which is inside StrictMode. Instead, add a ref directly to the element you want to reference. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-find-node```
        Which I will just be ignoring from now on.


