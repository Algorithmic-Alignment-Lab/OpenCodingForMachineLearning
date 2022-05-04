# Interface

## Navigating the Sub-pages/Sub-sections

The `space` key can be used to navigate to the next page whenever a section is completed. 

### Introduction

[TODO: insert image]

The dropdown can be navigated with a mouse. 

### Open Coding

[TODO: insert image]

You can use `tab` and `shift-tab` after selecting an item to move up and down the page accordingly. Items can also be clicked to activate their respective text forms.

`enter` submits your current annotations, and the section completes once all items have been annotated.

### Assisted Grouping

[TODO: insert image]

Users can navigate the search bar using their mouse to click and typing with their keyboard. `enter` prompts the search to execute.

After clicking on an item, the user will see that item populate under "Selected Annotations". Users can then use the lower text area to create a Group Name. 

Once a valid group name has been typed, the `Create Group` button will become available, and it can also be clicked via the hot-key `enter `. 

The left-hand navigation area contains created groups, which can be expanded and deleted if necessary.

This section completes once all annotations are in at least once group.

### Verification

[TODO: insert image]

The `y` and `n` hotkeys are available to either verify or deny that a prediction is accurate. If `y` is selected, the user will automatically navigate to the next prediction.

When `n` is selected, The user must select and confirm a group name from the dropdown before activating the next prediction.

Users can also use the `right arrow` key, once activated, to move onto the next prediction.

This section completes once all predictions have been rated and corrected.

### Results

[TODO: insert image]

## Development Instructions

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). 

npm must be installed to run this interface ([MacOS example](https://changelog.com/posts/install-node-js-with-homebrew-on-os-x)). After installing npm, to install rest of the necessary dependences, run

### `npm install`

### Additional Required Installations

`npm install node-fetch@2` is required to install v2 of npm-fetch, as v3 is an esm-only module. node-fetch allows the interface to interact with the server's api.

Server requests not working? Try

`rm -r package-lock.json node_dules`
`npm install`


## Available Scripts for Development

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

You may notice a 'Failed to compile' message - simply install the unresolved modules using `npm install [module name]`. 

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More about Create React

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

