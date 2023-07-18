// todo: consolidate / decide if we'll use routes or not.

import { Component } from "react";

// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";

import states from "./Constants/States";
import Introduction from "./Pages/Introduction/Introduction";
import OpenCoding from "./Pages/OpenCoding/OpenCoding";
import AssistedGrouping from "./Pages/AssistedGrouping/AssistedGrouping";
import Training from "./Pages/Training/Training";
import Results from "./Pages/Results/Results";

// NLPDocTool Pages
import Step1 from "./Pages/NLPDocTool/Step1";
import Step2 from "./Pages/NLPDocTool/Step2";
import Step3 from "./Pages/NLPDocTool/Step3";
import Step4 from "./Pages/NLPDocTool/Step4";
import Step5 from "./Pages/NLPDocTool/Step5";
// note to self: react doesn't like lowercase component names
import DocResults from "./Pages/NLPDocTool/DocResults";
import ViewDoc from "./Pages/NLPDocTool/ViewDoc";

const fetch = require("node-fetch");

class App extends Component {
	constructor(props) {
		super(props);
        this.DEFAULT_USER_MODEL_LINK = "http://localhost:PORT";
        this.DEFAULT_USER_MODEL_TRAIN_ENDPOINT = "/train";
        this.DEFAULT_USER_MODEL_PREDICT_ENDPOINT = "/predict";
		this.state = {
			pageState: states.introduction,
			optionID: null,
			texts: null,
			annotations: null,
			labels: null,
			name: "happydb",
			constants: null,
			verificationAccuracies: [],
			prepDataDone: false,
            // Remember user's model hosting information
            // todo: consider if this would need to be structured different
            // if they were using a website instead of localhost
            user_model_to_document: {
                link: this.DEFAULT_USER_MODEL_LINK, // have them specify everything here
                train_endpoint: this.DEFAULT_USER_MODEL_TRAIN_ENDPOINT,
                predict_endpoint: this.DEFAULT_USER_MODEL_PREDICT_ENDPOINT,
                // I'm assuming the user will give me a train method to 
                train_batch_size: 0, // = how many texts to send to their model to train on
                // todo: ^ maybe update naming (figure out what we're really asking for)
                train_num_epochs: 0, // = how many times to run train
                // didn't prompt for predict, because our interface seems to be more like a one at a time situation
                // but if we want to we can add that here and a corresponding slider in Step2.js
            },
		};
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
	async postData(url = "", data = {}) {
		// Default options are marked with *
		const response = await fetch(url, {
			method: "POST", // *GET, POST, PUT, DELETE, etc.
			mode: "cors", // no-cors, *cors, same-origin
			cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
			credentials: "same-origin", // include, *same-origin, omit
			headers: {
				"Content-Type": "application/json",
			},
			redirect: "follow", // manual, *follow, error
			referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
			body: JSON.stringify(data), // body data type must match "Content-Type" header
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
	async getDataWithParams(url = "", params = {}) {
		// Default options are marked with *
		let modifiedParams = Object.keys(params).map(
			(key) =>
				encodeURIComponent(key) + "=" + encodeURIComponent(String(params[key]))
		);
		let joinedParams = modifiedParams.join("&");

		const modifiedURL = url + "?" + joinedParams;

		const response = await fetch(modifiedURL, {
			method: "GET", // *GET, POST, PUT, DELETE, etc.
			mode: "cors", // no-cors, *cors, same-origin
			cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
			credentials: "same-origin", // include, *same-origin, omit
			headers: {
				"Content-Type": "application/json",
			},
			redirect: "follow", // manual, *follow, error
			referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
		});
		return response.json(); // parses JSON response into native JavaScript objects
	}

	/**
	 * Before the component mounts, we ask the server to prep the data and reset the local databases.
	 */
	async componentWillMount() {
		try {
			const response = await fetch("/data/prep_data");
			// show 404 or 500 errors
			if (!response.ok) {
				throw Error(response.statusText);
			}
			await response.json();
			this.setState({
				prepDataDone: true,
			});
		} catch (error) {
			console.log(error);
		}
	}

    getUserModelLink = () => {
        return this.state.user_model_to_document.link;
    }

    getUserModelTrainEndpoint = () => {
        return this.state.user_model_to_document.train_endpoint;
    }

    getUserModelPredictEndpoint = () => {
        return this.state.user_model_to_document.predict_endpoint;
    }

    // get a copy we can manipulate before doing set state
    getUserModelToDocument = () => {
        return {
            link: this.getUserModelLink(),
            train_endpoint: this.getUserModelTrainEndpoint(),
            predict_endpoint: this.getUserModelPredictEndpoint(),
        };
    }

    async testGetLink(link) { // , params={id: this.getOptionID()}) {
        link = "/api/"; // todo: figure out how to access proxies from setupProxy
        console.log(`Testing get link with link="${link}"...`);
        try {
            const response = await this.getDataWithParams(link);
            if (!response.ok) {
                alert(`Try again! (get link = ${link} FAILED)`);
                if ("msg" in Object.keys(response)) {
                    // throw Error(response.msg);
                    console.log("Error!", response.msg);
                    // todo: add state for if they errored, have popup appear if so
                } else if ("statusText" in Object.keys(response)) {
                    // throw Error(response.statusText);
                    console.log("Error!", response.statusText);
                }
            } else {
                console.log(`Successfully pinged (GET) link = "${link}"`);
            }
        } catch (error) {
            console.log(`Unable to run getDataWithParams(${link})`);
        }
    }

    async testPostLink(link, params={id: this.getOptionID()}) {
        const response = await this.postData(link, params);
        if (!response.ok) {
            if ("msg" in Object.keys(response)) {
                throw Error(response.msg);
            } else if ("statusText" in Object.keys(response)) {
                throw Error(response.statusText);
            }
        } else {
            console.log(`Successfully pinged (POST) link = "${link}"`);
        }
    }

    setUserModelLink = (link) => {
        const updated_user_model_to_document = this.getUserModelToDocument();
        console.log(`Setting user Model Link to ${link}`);
        // todo: ping the link they say and try to see if that works :0
        

        updated_user_model_to_document.link = link;
        this.setState({
            user_model_to_document: updated_user_model_to_document,
        });
    }

    setUserModelTrainEndpoint = (trainEndpoint) => {
        const updated_user_model_to_document = this.getUserModelToDocument();
        console.log(`Setting user Model trainEndpoint to ${trainEndpoint}`);
        
        // todo: ping the link they say and try to see if that works :0
        
        updated_user_model_to_document.train_endpoint = trainEndpoint;
        this.setState({
            user_model_to_document: updated_user_model_to_document,
        });
    }

    setUserModelPredictEndpoint = (predictEndpoint) => {
        const updated_user_model_to_document = this.getUserModelToDocument();
        console.log(`Setting user Model predictEndpoint to ${predictEndpoint}`);
        // todo: ping the link they say and try to see if that works :0
        
        updated_user_model_to_document.predict_endpoint = predictEndpoint;
        this.setState({
            user_model_to_document: updated_user_model_to_document,
        });
    }

    setUserModelTrainBatchSize = (trainBatchSize) => {
        const updated_user_model_to_document = this.getUserModelToDocument();
        console.log(`Setting User Model trainBatchSize to ${trainBatchSize}`);

        updated_user_model_to_document.train_batch_size = trainBatchSize;
        this.setState({
            user_model_to_document: updated_user_model_to_document,
        });
    }

    setUserModelTrainNumEpochs = (trainNumEpochs) => {
        const updated_user_model_to_document = this.getUserModelToDocument();
        console.log(`Setting User Model trainNumEpochs to ${trainNumEpochs}`);

        updated_user_model_to_document.train_num_epochs = trainNumEpochs;
        this.setState({
            user_model_to_document: updated_user_model_to_document,
        });
    }


	// data rows are an array of {id: uid, text: string}
	setDataRows = (rows) => {
		this.setState({
			texts: rows,
		});
	};

	getDataRows = () => {
		return this.state.texts;
	};

	setOptionID = (optionID) => {
		this.setState({
			optionID: optionID,
		});
	};

	getOptionID = () => {
		return this.state.optionID;
	};

	setConstants = (constants) => {
		this.setState({
			constants: constants,
		});
	};

	getConstants = () => {
		return this.state.constants;
	};

	// input array of {id: row_uid, text: string, annotation: string} saved for
	// first call to AssistedGrouping, our annotations backend call requires
	// [[row_uid, annotation], ...]
	saveAnnotationState = (annotations) => {
		let callAnnotations = [];

		for (let i = 0; i < annotations.length; i++) {
			callAnnotations.push([annotations[i].id, annotations[i].annotation]);
		}

		this.setState({
			annotations: callAnnotations,
		});
	};

	// expects input array of {id: row_uid, text: string, annotation: string}
	// our annotations backend call requires [[row_uid, annotation],...]
	saveAnnotations = (annotations) => {
		// insert some input checks
		let reducedAnnotations = [];
		let callAnnotations = [];

		for (let i = 0; i < annotations.length; i++) {
			reducedAnnotations.push({
				id: annotations[i].id,
				annotation: annotations[i].annotation,
			});
		}

		for (let i = 0; i < annotations.length; i++) {
			callAnnotations.push([annotations[i].id, annotations[i].annotation]);
		}

		// this will be replaced with call to backend
		this.setState({
			annotations: reducedAnnotations,
		});

		let res = this.postData("/data/save_annotations", {
			rows: callAnnotations,
			id: this.state.optionID,
		});
		console.log(res);
	};

	loadAnnotations = () => {
		// this will be replaced with call to backend
		// maybe copy first
		return this.state.annotations;
	};

	saveLabelState = (labels) => {
		console.log("saving label state:", labels);
		this.setState({
			labels: labels,
		});
	};

	// expects input array of {id: uid, true_label: string}
	// our labels array maps {id: uid, true_label: string}
	saveLabels = (labels) => {
		this.postData("/data/save_labels", {
			rows: labels,
			id: this.state.optionID,
		});
	};

	getLabels = () => {
		return this.state.labels;
	};

	loadLabelSet = () => {
		// this will be replaced with call to backend
		// that is dependent on the result of SAVE LABELS not UPDATE LABELS
		let labelSet = new Set(this.state.labels.map((row) => row.label));
		let labelArray = Array.from(labelSet);

		let finalLabels = [];

		for (let i = 0; i < labelArray.length; i++) {
			finalLabels.push({ id: i, label: labelArray[i] });
		}

		return finalLabels;
	};

	loadLabels = () => {
		// this will be replaced with call to backend
		// maybe copy first
		return this.state.labels;
	};

	retrainModel = () => {
		// this will be replaced with call to backend
		return true;
	};

	saveAccuracy = (accuracy) => {
		let accuracies = this.state.verificationAccuracies;
		accuracies.push(accuracy);
		this.setState({
			verificationAccuracies: accuracies,
		});
	};

	getAccuracy = () => {
		return this.state.verificationAccuracies;
	};

	// add render functions for each component with the arguments we want to pass for reusability
	renderIntroduction() {
        console.log('In renderIntroduction()');
		return (
			<Introduction
				setOptionID={this.setOptionID}
				updateState={this.updateState}
				setConstants={this.setConstants}
				postData={this.postData}
			/>
		);
	}

	renderOpenCoding() {
        console.log('In renderOpenCoding()');
		return (
			<OpenCoding
				getOptionID={this.getOptionID}
				getConstants={this.getConstants}
				getDataWithParams={this.getDataWithParams}
				setDataRows={this.setDataRows}
				saveAnnotations={this.saveAnnotations}
				saveAnnotationState={this.saveAnnotationState}
				updateState={this.updateState}
			/>
		);
	}

	renderAssistedGrouping() {
        console.log('In renderAssistedGrouping()');
		return (
			<AssistedGrouping
				loadAnnotations={this.loadAnnotations}
				getDataRows={this.getDataRows}
				saveLabels={this.saveLabels}
				updateState={this.updateState}
				getOptionID={this.getOptionID}
				getDataWithParams={this.getDataWithParams}
				saveLabelState={this.saveLabelState}
				postData={this.postData}
			/>
		);
	}

    renderTraining() {
        console.log('In renderTraining()');
        return <Training
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
        />
    }

    // place this here to reflect the actual order
	renderResults() {
        console.log('In renderResults()');
		return (
			<Results
				updateState={this.updateState}
				getOptionID={this.getOptionID}
				getDataWithParams={this.getDataWithParams}
				getAccuracy={this.getAccuracy}
                getLabels={this.getLabels}
			/>
		);
	}

	renderDocStep1() {
        console.log('In renderDocStep1()');
		return (<Step1
            updateState={this.updateState}
            getOptionID={this.getOptionID}
            getDataWithParams={this.getDataWithParams}
            postData={this.postData}
            getUserModelToDocument={this.getUserModelToDocument}
            
            getUserModelLink={this.getUserModelLink}
            setUserModelLink={this.setUserModelLink}
           
            getUserModelTrainEndpoint={this.getUserModelTrainEndpoint}
            setUserModelTrainEndpoint={this.setUserModelTrainEndpoint}

            getUserModelPredictEndpoint={this.getUserModelPredictEndpoint}
            setUserModelPredictEndpoint={this.setUserModelPredictEndpoint}

            testGetLink={this.testGetLink}
            testPostLink={this.testPostLInk}
        />);
	}

    renderDocStep2() {
        console.log(this.state.user_model_to_document);
        console.log('In renderDocStep2()');
		return <Step2
            updateState={this.updateState}
            getOptionID={this.getOptionID}
            getDataWithParams={this.getDataWithParams}
            postData={this.postData}

            setUserModelTrainBatchSize={this.setUserModelTrainBatchSize}
            setUserModelTrainNumEpochs={this.setUserModelTrainNumEpochs}
        />
	}

    renderDocStep3() {
        console.log('In renderDocStep3()');
		return <Step3
            updateState={this.updateState}
            getOptionID={this.getOptionID}
            getDataWithParams={this.getDataWithParams}
            postData={this.postData}
        />
	}

    renderDocStep4() {
        console.log('In renderDocStep4()');
		return <Step4
            updateState={this.updateState}
            getOptionID={this.getOptionID}
            getDataWithParams={this.getDataWithParams}
            postData={this.postData}
        />
	}

    renderDocStep5() {
        console.log('In renderDocStep5()');
		return <Step5
            updateState={this.updateState}
            getOptionID={this.getOptionID}
            getDataWithParams={this.getDataWithParams}
            postData={this.postData}
        />
	}

    // fix order so that we can visually see this comes before view doc
    renderDocResults() {
        console.log('In renderDocResults()');
        return <DocResults
            updateState={this.updateState}
            getOptionID={this.getOptionID}
            getDataWithParams={this.getDataWithParams}
            postData={this.postData}
        />
    }

    renderViewDoc() {
        console.log('In renderViewDoc()');
        return <ViewDoc
            updateState={this.updateState}
            getOptionID={this.getOptionID}
            getDataWithParams={this.getDataWithParams}
            postData={this.postData}
        />
    }


	getView(page) {
		if (this.state.prepDataDone) {
			if (page === states.introduction) {
				return this.renderIntroduction();
			} else if (page === states.openCoding) {
				return this.renderOpenCoding();
			} else if (page === states.assistedGrouping) {
				return this.renderAssistedGrouping();
                
			} else if (page === states.training) {
				return this.renderTraining();
			} else if (page === states.results) {
				return this.renderResults();
			} else if (page === states.docStep1) {
                return this.renderDocStep1();
            } else if (page === states.docStep2) {
                return this.renderDocStep2();
            } else if (page === states.docStep3) {
                return this.renderDocStep3();
            } else if (page === states.docStep4) {
                return this.renderDocStep4();
            } else if (page === states.docStep5) {
                return this.renderDocStep5();
            } else if (page === states.docResults) {
                return this.renderDocResults();
            } else if (page === states.docView) {
                return this.renderViewDoc();
            } else {
				// default value if state transitions ever fail
				return <div />;
			}
		} else {
			return <div />;
		}
	}

	updateState = (newPageState) => {
		console.log("new pagestate: " + newPageState);
		this.setState({
			pageState: newPageState,
		});
	};

	render() {
		return (
			<div
				style={{
					margin: "25px",
					height: "90vh",
					width: "90vw",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
	            {this.getView(this.state.pageState)}
          
			</div>
		);
	}
}

export default App;
