- [X] Continue trying to render summary page

7/5
- [X] Reintroduce loop where they can go back and code more if they don't like what they see here in the results


7/6
- Fix buttons rendering side by side

Data passing
- [ ] Have the model predict the rest of the labels 

    - continue looking at Verification.js to see how they ran the predictions.
    // i already tried just getLabels (which just seems to load the codes, not the groups)
    // with the format (id, annotation)

    - [ ] investigate how to send the groups the user gave us from the app or the backend
        - maybe try and pass the whole label set as a prop?
        // lets check how verification did it

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


