import React, {Component} from 'react';

import './App.css';

import states from './Constants/States';
import Introduction from './Pages/Introduction/Introduction'
import OpenCoding from './Pages/OpenCoding/OpenCoding';
import AssistedGrouping from './Pages/AssistedGrouping/AssistedGrouping';
import Verification from './Pages/Verification/Verification';
import Results from './Pages/Results/Results';

const fetch = require('node-fetch');


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageState: states.introduction,
      optionID: null,
      texts: null,
      annotations: null,
      labels: null,
      name: 'happydb',
      constants: null,
      verificationAccuracies: [],
      prepDataDone: false,
    }
  }

  /**
   * Helper function for posting data via an http request to the local Flask server.
   * 
   * Borrowed from  https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
   * 
   * @param {string} url 
   * @param {} data 
   * @returns 
   */
  async postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  /**
   * Helper function for getting data from an http request to the local Flask server.
   * 
   * @param {string} url 
   * @param {*} params 
   * @returns 
   */
  async getDataWithParams(url = '', params = {}) {
    // Default options are marked with *
    let modifiedParams = Object.keys(params).map(key => encodeURIComponent(key) + "=" + encodeURIComponent(String(params[key])));
    let joinedParams = modifiedParams.join("&");

    const modifiedURL = url + "?" + joinedParams;

    const response = await fetch(modifiedURL, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  
  /**
   * Before the component mounts, we ask the server to prep the data and reset the local databases. 
   */
  async componentWillMount() {
    try {
      const response = await fetch('/data/prep_data');
      // show 404 or 500 errors
      if (!response.ok) {
          throw Error(response.statusText);
      }
      await response.json();
      this.setState({
        prepDataDone: true
      });
    } catch (error) {
        console.log(error);
    }
  }

  // data rows are an array of {id: uid, text: string}
  setDataRows = (rows) => {
    this.setState({
      texts: rows
    });
  }

  getDataRows = () => {
    return this.state.texts;
  }

  setOptionID = (optionID) => {
    this.setState({
      optionID: optionID
    });
  }

  getOptionID = () => {
    return this.state.optionID;
  }

  setConstants = (constants) => {
    this.setState({
      constants: constants
    });
  }

  getConstants = () => {
    return this.state.constants;
  }

  // input array of {id: row_uid, text: string, annotation: string} saved for 
  // first call to AssistedGrouping, our annotations backend call requires 
  // [[row_uid, annotation], ...]
  saveAnnotationState = (annotations) => {
    let callAnnotations = [];

    for (let i = 0; i < annotations.length; i++){
      callAnnotations.push([annotations[i].id, annotations[i].annotation]);
    }

    this.setState({
      annotations: callAnnotations
    });

  }

  // expects input array of {id: row_uid, text: string, annotation: string}
  // our annotations backend call requires [[row_uid, annotation],...]
  saveAnnotations = (annotations) => {
    // insert some input checks
    let reducedAnnotations = [];
    let callAnnotations = [];

    for (let i = 0; i < annotations.length; i++){
      reducedAnnotations.push({id: annotations[i].id, annotation: annotations[i].annotation});
    }

    for (let i = 0; i < annotations.length; i++){
      callAnnotations.push([annotations[i].id, annotations[i].annotation]);
    }

    // this will be replaced with call to backend
    this.setState({
      annotations: reducedAnnotations
    });

    let res = this.postData('/data/save_annotations', {"rows": callAnnotations, "id": this.state.optionID});
    console.log(res);
  }

  loadAnnotations = () => {
    // this will be replaced with call to backend
    // maybe copy first
    return this.state.annotations;
  }

  saveLabelState = (labels) => {
    console.log('saving label state:', labels);
    this.setState({
      labels: labels
    });
  }

  // expects input array of {id: uid, true_label: string}
  // our labels array maps {id: uid, true_label: string}
  saveLabels = (labels) => {
    this.postData('/data/save_labels', {"rows": labels, "id": this.state.optionID});
  }

  getLabels = () => {
    return this.state.labels;
  }

  loadLabelSet = () => {
    // this will be replaced with call to backend
    // that is dependent on the result of SAVE LABELS not UPDATE LABELS
    let labelSet = new Set(this.state.labels.map((row) => row.label));
    let labelArray = Array.from(labelSet);

    let finalLabels = []

    for (let i = 0; i < labelArray.length; i++){
      finalLabels.push({id: i, label: labelArray[i]});
    }
    
    return finalLabels
  }

  loadLabels = () => {
    // this will be replaced with call to backend
    // maybe copy first
    return this.state.labels;
  }

  retrainModel = () => {
    // this will be replaced with call to backend
    return true;
  }

  saveAccuracy = (accuracy) => {
    let accuracies = this.state.verificationAccuracies;
    accuracies.push(accuracy);
    this.setState({
      verificationAccuracies: accuracies
    });
  }

  getAccuracy = () => {
    return this.state.verificationAccuracies;
  }

  getView(page) {
    if (this.state.prepDataDone){
    if (page === states.introduction) {
      return <Introduction
        setOptionID = {this.setOptionID}
        updateState = {this.updateState}
        setConstants = {this.setConstants}
        postData = {this.postData}
        />;
    } else if (page === states.openCoding) {
      return <OpenCoding
        getOptionID = {this.getOptionID}
        getConstants = {this.getConstants}
        getDataWithParams = {this.getDataWithParams}
        setDataRows = {this.setDataRows}
        saveAnnotations = {this.saveAnnotations}
        saveAnnotationState = {this.saveAnnotationState}
        updateState = {this.updateState}
        />;
    } else if (page === states.assistedGrouping) {
      return <AssistedGrouping
        loadAnnotations = {this.loadAnnotations}
        getDataRows = {this.getDataRows}
        saveLabels = {this.saveLabels}
        updateState = {this.updateState}
        getOptionID = {this.getOptionID}
        getDataWithParams = {this.getDataWithParams}
        saveLabelState = {this.saveLabelState}
        postData = {this.postData}
        />;
    } else if (page === states.verification) {
      return <Verification
        loadLabelSet = {this.loadLabelSet}
        loadLabels = {this.loadLabels}
        saveLabels = {this.saveLabels}
        getLabels = {this.getLabels}
        retrainModel = {this.retrainModel}
        getDataRows = {this.getDataRows}
        updateState = {this.updateState}
        getOptionID = {this.getOptionID}
        getDataWithParams = {this.getDataWithParams}
        postData = {this.postData}
        saveAccuracy = {this.saveAccuracy}
        />;
    } else if (page === states.results) {
      return <Results
        updateState = {this.updateState}
        getOptionID = {this.getOptionID}
        getDataWithParams = {this.getDataWithParams}
        getAccuracy = {this.getAccuracy}
        />;
    } else {
      // default value if state transitions ever fail
      return <div/>;
    }} else {
      return <div/>;
    }
  }

  updateState = (newPageState) => {
    console.log('new pagestate: ' + newPageState);
    this.setState({
      pageState: newPageState
    })
  }

  render() {
    return (
        <div style={{margin: '25px', height: '90vh', width: '90vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          {this.getView(this.state.pageState)}
        </div>
    );
  }

}

export default App;
