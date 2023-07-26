import { Component } from "react";
import FixedSlider from '../../Custom/FixedSlider'

import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import { ThemeProvider } from "@mui/material/styles";
import Header from "./blog/Header.js";

import Footer from "./blog/Footer.js";
import Stack from "@mui/material/Stack";
import theme from "./blog/theme.js";
import Box from "@mui/material/Box";

import states from "./../../Constants/States";

import CallbackKeyEventButton from "../../Custom/CallbackKeyEventButton";
import LinearProgress from "@material-ui/core/LinearProgress";

const progress = 20;

const BATCH_SIZE_SLIDER_MIN_VALUE = 10;
const BATCH_SIZE_SLIDER_MAX_VALUE = 300;
const BATCH_SIZE_SLIDER_DEFAULT = 100;

const NUM_EPOCHS_SLIDER_MIN_VALUE = 1;
const NUM_EPOCHS_SLIDER_MAX_VALUE = 15;
const NUM_EPOCHS_SLIDER_DEFAULT = 1;

class Step2 extends Component {
	constructor(props) {
		super(props);
		this.state = {
			predictEndpoint: "/",
			parameters: [],
			name: "",
			type: "",
			paramIndex: 1,
			outputs: [],
			nameO: "",
			typeO: "",
			outputIndex: 1,

            // todo: add state variables (and corresponding handler methods) to control the sliders
            batchSize: BATCH_SIZE_SLIDER_DEFAULT,
            numEpochs: NUM_EPOCHS_SLIDER_DEFAULT,

			sectionComplete: true, 
		};
	}

	onNextSubmit = () => {
        this.props.setUserModelTrainBatchSize(this.state.batchSize);
        this.props.setUserModelTrainNumEpochs(this.state.numEpochs)
		this.props.updateState(states.docStep3);
	};

	/**
	 * Callback function for next submit action.
	 */
	handleNextKeyPress = (event) => {
		if (event.key === " " && this.state.sectionComplete) {
			this.onNextSubmit();
		}
	};

	handleTextEndpoint = (event) => {
		this.setState({
			predictEndpoint: event.target.value,
		});
	};

	handleTextName = (event) => {
		this.setState({
			name: event.target.value,
		});
	};

	handleTextType = (event) => {
		this.setState({
			type: event.target.value,
		});
	};

	clearParamInput = (event) => {
		document.getElementById("nameBox").value = "";
	};

	handleTextNameO = (event) => {
		this.setState({
			nameO: event.target.value,
		});
	};

	handleTextTypeO = (event) => {
		this.setState({
			typeO: event.target.value,
		});
	};

	clearOutputInput = (event) => {
		document.getElementById("nameBoxO").value = "";
		document.getElementById("typeBoxO").value = "";
	};

	render() {
		return (
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Container maxWidth="lg">
					<Header title="NLPDocTool" />
					<main>
						<Stack
							justifyContent="center"
							alignItems="center"
							spacing={2}
							sx={{ paddingTop: 10, paddingRight: 5, paddingLeft: 5, alignItems: 'left'}}
						>
							<h2>Step 2: Add the Training Parameters </h2>
                            <div style = {{alignItems: 'left', marginBottom: '10px'}}>
                                
                                <div style = {{alignItems: 'center', marginBottom: '10px'}}>
                                    {"How many text samples would you like to be sent for each train epoch (batch size)?"}
                                    <b style = {{marginLeft: '5px'}}>
                                        {this.state.batchSize}
                                    </b> 
                                </div>
                                <div style = {{ marginBottom: '20px'}}>
                                    <FixedSlider 
                                        name='Batch Size'
                                        width={'29.5vw'}
                                        startValue={BATCH_SIZE_SLIDER_MIN_VALUE}
                                        endValue={BATCH_SIZE_SLIDER_MAX_VALUE}
                                        defaultValue={BATCH_SIZE_SLIDER_DEFAULT}
                                        updateValue={(value) => {this.setState({batchSize: value})}}
                                    />
                                </div>
                                <div style = {{alignItems: 'center', marginBottom: '10px'}}>
                                    {"How many epochs should the model be trained with?"}
                                    <b style = {{marginLeft: '5px'}}>
                                        {this.state.numEpochs}
                                    </b> 
                                </div>
                                <div style = {{ marginBottom: '20px'}}>
                                    <FixedSlider 
                                        name='Number of Epochs'
                                        width={'10vw'}
                                        startValue={NUM_EPOCHS_SLIDER_MIN_VALUE}
                                        endValue={NUM_EPOCHS_SLIDER_MAX_VALUE}
                                        defaultValue={NUM_EPOCHS_SLIDER_DEFAULT}
                                        updateValue={(value) => this.setState({numEpochs: value})}
                                    />
                                </div>
                            </div>
							{/* <Typography variant="h6">
								Specify how to run the prediction{" "}
							</Typography>
							<Box component="div" sx={{ display: "inline" }}>
								<Typography
									variant="h6"
									sx={{ fontWeight: 400, display: "inline" }}
									noWrap={false}
								>
									Specify the endpoint of your predict method (by default for
									Hugging Face it is "/"):{" "}
								</Typography>

								<TextField
									id="endpoint"
									variant="filled"
									fullwidth="true"
									defaultValue="/"
									size="small"
									hiddenLabel
									onChange={this.handleTextEndpoint}
									sx={{ paddingLeft: 5 }}
								/>
							</Box>
							<Typography variant="h6">
								Specify the name of the String to run the model on
							</Typography>
							<Typography paragraph>
								Note that only default parameters for running the model are
								accepted at this time.
							</Typography>

							<Box component="div" sx={{ display: "inline", paddingBottom: 4 }}>
								<TextField
									id="nameBox"
									label="Name"
									variant="filled"
									// fullwidth="true"
									size="small"
									// hiddenLabel
									onChange={this.handleTextName}
									sx={{ paddingLeft: 7 }}
								/>

								<IconButton
									size="large"
									onClick={(event) => {
										var i = this.state.paramIndex;
										var n = this.state.name;
										var t = this.state.type;
										let parameter = {
											id: i,
											name: n,
											type: t,
										};

										// put i + 1 in paramIndex
										this.setState({
											type: "",
											// name: "",
											paramIndex: i,
										});

										//push should be here in the future
										this.state.parameters[0] = parameter;

										// this.clearParamInput(event);
										console.log(this.state.parameters);
										console.log(this.state.predictEndpoint);
									}}
								>
									<CheckCircleIcon />
								</IconButton>
							</Box>
							<Typography variant="h6">Specify the model output</Typography>
							<Typography paragraph>
								Note: Only JSON Output is accepted at this time.
								<br></br> Further, the Name entered must be the name of model
								output string.
								<br></br> Only single strings (and not arrays) are accepted at
								this time.
							</Typography>

							<Box component="div" sx={{ display: "inline", paddingBottom: 4 }}>
								<TextField
									id="nameBoxO"
									label="Name"
									variant="filled"
									// fullwidth="true"
									size="small"
									// hiddenLabel
									onChange={this.handleTextNameO}
									sx={{ paddingLeft: 7 }}
								/>

								<IconButton
									size="large"
									onClick={(event) => {
										var i = this.state.outputIndex;
										var n = this.state.nameO;
										var t = this.state.typeO;
										let output = {
											id: i,
											name: n,
											type: t,
										};

										//outputIndex should be i+1
										this.setState({
											typeO: "",
											// nameO: "",
											outputIndex: i,
										});

										//push to outputs
										this.state.outputs[0] = output;

										// this.clearOutputInput(event);
										console.log(this.state.outputs);
									}}
								>
									<CheckCircleIcon />
								</IconButton>
							</Box> */}
							{/* <LinkButton to="/NLPDocTool/step3" variant="contained"
                  onClick={
                    () => {
                      Model.parameters = this.state.parameters;
                      Model.outputs = this.state.outputs;
                      Model.endpoint=this.state.predictEndpoint;
                      console.log(Model);
                    }
                  }
                  >
                    Confirm
                  </LinkButton> */}
							<Box sx={{ margin: "15px", width: "100%" }}>
								<CallbackKeyEventButton
									callBackFunc={this.handleNextKeyPress}
									buttonAvailable={this.state.sectionComplete}
									clickFunc={this.onNextSubmit}
									text={"Next (space)"}
								/>
							</Box>
							<Box sx={{ margin: "15px" }}>
								<LinearProgress variant="determinate" value={progress} />
							</Box>
						</Stack>
					</main>
				</Container>

				<Footer title="Designed By" description="XXX" />
			</ThemeProvider>
		);
	}
}

export default Step2;
