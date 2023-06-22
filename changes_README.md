

# Changes to setup commands

Fixed issues unsupported openssl by using the legacy version.
Ignored cross dependencies from npm installs by having them be forced.

So, now the commands to setup are:
```sh
bash fix_unsupported_envelope.txt
./setup.sh
```
- I had to do the export command in a separate file because it didn't seem to take effect when I just ran it in the setup.sh itself


# User Interface
Since our plan is to place NLPDocTool in between AssistedGrouping and Verification, I added a temporary page so I could get the feel of how to go between pages.
Find a skeleton of the main js I talk about in
`interface/src/Pages/DocToolHome/component_skeleton.js`

## Things to remember about implementing pages
### Initializing the page 
Create a folder in interface/src/Pages for your class
i.e. `interface/src/Pages/DocToolHome/`

Within that, create at least the file for your class
i.e. `interface/src/Pages/DocToolHome/DocToolHome.js`
(your helper codes that only you need for this page will also go here)

### Initialize the react component 
```js
import React, {Component} from 'react';
class DocToolHome extends Component {}
```
- in the constructor, setup the state to hold at least these variables
```js
this.state = {
    sectionComplete: false, // set on for now so we can test easier.
    progressPercent: 100, 
    // todo: change this to the intermediate value between assisted grouping and verification
};
```
- we use sectionComplete in our next button function (handleNextKeyPress) 
and as the boolean to determine if the next button is enabled.

### Imports and Necessary Functions
There are additional imports that are necessary to have cohesion 
and connections between the pages.

- states
```js
import states from './../../Constants/States';
```
Usage: use the page numbers dictionary (states) 
to set the next page when the next button is clicked

- CallBackKeyEventButton 
```js
import CallbackKeyEventButton from '../../Custom/CallbackKeyEventButton';
```
Usage: the *button to navigate to the next page*,
will pass in a function that we define to specify what we want to happen next.
(basically, which page to go to next from states)
    - for consistency, define the function as follows:
```js
    onNextSubmit = () => {
        this.props.updateState(states.verification); // states.[whatever page alias you want next]
    }
    // allow keyboard shortcut.
    handleNextKeyPress = (event) => {
        if (event.key === ' ' && this.state.sectionComplete){
            this.onNextSubmit();
        }
    };
```

Example:
```js
    <CallbackKeyEventButton
        callBackFunc={this.handleNextKeyPress}
        buttonAvailable={this.state.sectionComplete}
        clickFunc={this.onNextSubmit}
        text={'Next (space)'}
    />
```

- LinearProgress
```js
import CallbackKeyEventButton from '../../Custom/CallbackKeyEventButton';
```
- uses the constant progress we set up at the top of our component.js file
to show the user how close they are to getting through all of the pages
```js
    <LinearProgress variant="determinate" value={progress}/>
```


Remember to export the component so that our App.js can import it
`export default DocToolHome;`

### Setup the page to be rendered by the app
Set a value for that page in Constants/States.js
    i.e. `doctoolhome: 5`
    // the values themselves seem arbitrary, 
    // since we set the next pages pretty much manually in each class

Import the page you created following the syntax of the other imports
usually `import [class name] from ./[path]`
i.e. `import DocToolHome from './Pages/DocToolHome/DocToolHome'`
// For consistency, I tried to follow the directory structure for pages
// `Pages/ClassName/ClassName.js`

In App.js, in getView(page) // which is called in render
- check that its time to render your page
(i.e. `states.doctoolhome === page`),
- then return your react component (passing the necessary properties)
```js
return <DocToolHome
    // pass props here
/>;
```

Pass the function to change the page state (updateState) using props 
