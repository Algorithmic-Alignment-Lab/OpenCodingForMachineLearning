import React, {Component} from 'react';

import './App.css';

import states from './Constants/States';
import Introduction from './Pages/Introduction/Introduction'
import OpenCoding from './Pages/OpenCoding/OpenCoding';
import AssistedGrouping from './Pages/AssistedGrouping/AssistedGrouping';
// import Labeling from './Pages/Labeling/Labeling';
import Verification from './Pages/Verification/Verification';
import Results from './Pages/Results/Results';

const fetch = require('node-fetch');

const fakeData = ["I went on a successful date with someone I felt sympathy and connection with.", 'I was happy when my son got 90% marks in his examination ', 'I went to the gym this morning and did yoga.', 'We had a serious talk with some friends of ours who have been flaky lately. They understood and we had a good evening hanging out.', 'I went with grandchildren to butterfly display at Crohn Conservatory\n', 'I meditated last night.', 'I made a new recipe for peasant bread, and it came out spectacular!', 'I got gift from my elder brother which was really surprising me', 'YESTERDAY MY MOMS BIRTHDAY SO I ENJOYED', 'Watching cupcake wars with my three teen children', 'I came in 3rd place in my Call of Duty video game.', 'I completed my 5 miles run without break. It makes me feel strong.', 'went to movies with my friends it was fun ', 'I was shorting Gold and made $200 from the trade.', "Hearing Songs It can be nearly impossible to go from angry to happy, so you're just looking for the thought that eases you out of your angry feeling and moves you in the direction of happiness. It may take a while, but as long as you're headed in a more positive direction youall be doing yourself a world of good.", 'My son performed very well for a test preparation.', 'I helped my neighbour to fix their car damages. ', "Managed to get the final trophy in a game I was playing. ", "A hot kiss with my girl friend last night made my day", "My new BCAAs came in the mail. Yay! Strawberry Lemonade flavored aminos make my heart happy."]

// TODO: how to store annotation objects; request specific datastructure.. sqlite cry
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
      verificationAccuracies: [],
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
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

  async getDataWithParams(url = '', params = {}) {
    // Default options are marked with *
    let modifiedParams = Object.keys(params).map(key => "?" + encodeURIComponent(key) + "=" + encodeURIComponent(String(params[key])));
    let joinedParams = modifiedParams.join("&");

    const modifiedURL = url + joinedParams;
    console.log("modified url: ", modifiedURL)

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

  async componentDidMount() {
    try {
        const response = await fetch('/data/get_all_data_options');
        // show 404 or 500 errors
        if (!response.ok) {
            throw Error(response.statusText);
        }

        const data = await response.json();
        let optionsFull = data.options
        let formattedOptionsFull = [];

        for (let option_id in optionsFull) {
            formattedOptionsFull.push({id: option_id, text: optionsFull[option_id].name});
        }

        this.setState({
            dataOptions: formattedOptionsFull
        });
    } catch (error) {
        console.log(error);
    }
}

  

  // start the call to the backend to load data
  async componentWillMount() {
    try {
      const response = await fetch('/data/prep_data');
      // show 404 or 500 errors
      if (!response.ok) {
          throw Error(response.statusText);
      }
      const data = await response.json();
      console.log(data.body);
    } catch (error) {
        console.log(error);
    }
  }

  loadDataRows = (optionID) => {
    this.getDataWithParams('/data/get_data_option/', {"id": this.state.optionID}).then(
      data => {

        let parsed_data = [];

        for (let row_id in data.rows) {
          parsed_data.push({id: row_id, text: data.rows[row_id]});
        }

        this.setState({
          texts: parsed_data
        });
      }
    );

    return true;
  }

  // data rows are an array of {id: uid, text: string}

  setDataRows = (rows) => {
    this.setState({
      texts: rows
    });
  }

  getDataRows = () => {

    return this.state.texts;

    // const getPosts = async () => {
    //   try {
    //     // const response = await fetch('http://localhost:5000/data/' + String(this.state.name),
    //     const response = await fetch('/data/' + String(this.state.name),
    //     // {
    //     //   method: "get",
    //     //   body: JSON.stringify(body),
    //     //   headers: { "Content-Type": "application/json" }
    //     // }
    //     );
    //     console.log('response recieved');
    //     const data = await response.json();
    //     console.log('data received');
    //     console.log(data);
    //   } catch(err) {
    //     console.log(err); // failed to fetch
    //   }
    // }

    // getPosts();

    // fetch('http://127.0.0.1:5000/data/' + String(this.state.name)) 
    // // fetch('http://localhost:5000/data/' + String(this.state.name)) 
    //   .then((response) => response.json()) 
    //   .then(text => console.log(text));
    //   // .catch((err => console.error(err));

    // let n = fakeData.length;
    // let data = [];
    // // let fakeTexts = ["once upon a time there was something magical somewhere old and magical", "in a land far far away", "it was the happiest of times", "at a time of things that were"];

    // for (let i = 0; i < n; i++){
    //   data.push({id: i, text: fakeData[i]});
    //   // for (let j = 0; j < 4; j++){
    //   //     data.push({id: i*4 + j, text: fakeTexts[j]});
    //   // }
    // }

    // return data;
  }

  setOptionID = (optionID) => {
    // this.loadDataRows(optionID);
    this.setState({
      optionID: optionID
    });
  }

  getOptionID = () => {
    return this.state.optionID;
    // return 1;
  }

  // input array of {id: row_uid, text: string, annotation: string} saved for 
  // first call to AssistedGrouping
  // our annotations backend call requires [[row_uid, annotation],...]
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

  // expects input array of {id: uid, label: string}
  // our labels array maps {id: uid, label: string}
  saveLabels = (labels) => {
    // insert some input checks
    // let reducedLabels = [];

    // for (let i = 0; i < labels.length; i++){
    //   reducedLabels.push({id: labels[i].id, label: labels[i].label});
    // }

    // this will be replaced with call to backend
    // this.setState({
    //   labels: labels
    // });
    console.log('saving labels:', labels);

    let res = this.postData('/data/save_labels', {"rows": labels, "id": this.state.optionID});
    console.log(res);
  }

  getLabels = () => {
    console.log('getting labels:', this.state.labels);
    return this.state.labels;
  }

  // expects input array of {id: uid, label: string}
  // our labels array maps {id: uid, label: string}
  updateLabels = (labels) => {
    // this will be replaced with call to backend
    // optimize something something
    this.setState({
      labels: labels
    });

    let res = this.postData('/data/update_labels', {"rows": labels, "id": this.state.optionID});
    console.log(res);
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
    console.log('saving accuracy:', accuracy);
    let accuracies = this.state.verificationAccuracies;
    accuracies.push(accuracy);

    console.log('accuracies: ' + accuracies);

    this.setState({
      verificationAccuracies: accuracies
    });
  }

  getAccuracy = () => {
    return this.state.verificationAccuracies;
  }

  getView(page) {
    if (page === states.introduction) {
      return <Introduction
        setOptionID = {this.setOptionID}
        updateState = {this.updateState}
        />;
    } else if (page === states.openCoding) {
      return <OpenCoding
        getOptionID = {this.getOptionID}
        getDataWithParams = {this.getDataWithParams}
        setDataRows = {this.setDataRows}
        // getDataRows = {this.getDataRows}
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
        // updateLabels = {this.updateLabels}
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
