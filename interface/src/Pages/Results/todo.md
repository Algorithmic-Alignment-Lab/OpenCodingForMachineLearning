- [ ] Continue trying to render summary page

    - [ ] consider different ways we want to render the component
        - [ ] maybe have adjustable width for the table text and annotation columns
        - [ ] set text to wrap around 
        // or allow them to scroll throw a cell.
        // I feel like the former is easier.
        - attempted with div css text wrapping and Typographys which supposedly automatically wrap text

        Note: as I fiddle with mui, I get this warning
        ```Warning: findDOMNode is deprecated in StrictMode. findDOMNode was passed an instance of Transition which is inside StrictMode. Instead, add a ref directly to the element you want to reference. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-find-node```
        Which I will just be ignoring from now on.

    - so far I'm just working off https://mui.com/material-ui/react-table/#data-table

Passing data 

    - [ ] investigate how to send the groups the user gave us from the app or the backend