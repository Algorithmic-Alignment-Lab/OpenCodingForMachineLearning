import React, { Component } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import { ThemeProvider } from "@mui/material/styles";
import Header from "./blog/Header.js";

import Footer from "./blog/Footer.js";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import theme from "./blog/theme.js";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";

import states from "./../../Constants/States";
import CallbackKeyEventButton from "./../../Custom/CallbackKeyEventButton";

import Model from './Model';

const progress = 0;

function Step1Content(props) {
	const [anchorEl, setAnchorEl] = React.useState(null);

	const [urlInput, setUrlInput] = React.useState(null);
    const [finetuneEndpointInput, setFinetuneEndpointInput] = React.useState(null);
    const [predictEndpointInput, setPredictEndpointInput] = React.useState(null);
    
    var enteredUrl = false;
    var enteredFinetuneEndpoint = false;
    var enteredPredictEndpoint = false;

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	// const handleText = (event) => {
	// 	setTextInput(event.target.value);
	// 	Model.apiLink = textInput;
	// };

	// const handleUrlText = (event) => {
	// 	setUrlInput(event.target.value);
    //     enteredUrl = false;
    //     if (event.key === "Enter") {
    //         enteredUrl = true;
    //         try {
    //             //todo: come back and validate link once we figure out proxies
    //             //props.testGetLink(urlInput);
    //             props.setUserModelLink(urlInput);
    //         } catch (error) {
    //             console.log("Something went wrong :0");
    //             console.log(error);
    //         }
    //     }
	// };

	const handleFinetuneEndpointText = (event) => {
		setFinetuneEndpointInput(event.target.value);
        enteredFinetuneEndpoint = false;
        if (event.key === "Enter") {
            enteredFinetuneEndpoint = true;
            // props.setUserModelFinetuneEndpoint(finetuneEndpointInput);
            let confirmedInput = true;
            if (Model.finetuneEndpoint === finetuneEndpointInput) {
                console.log(`Keeping finetuneEndpoint the same: ${finetuneEndpointInput}`);
            } else if (Model.finetuneEndpoint !== "") {
                confirmedInput = window.confirm(`Are you sure you want to change finetuneEndpoint from\n${Model.finetuneEndpoint} => ${finetuneEndpointInput}`);
            } else if (confirmedInput) {
                console.log(`Setting finetuneEndpoint to ${finetuneEndpointInput}`)
                Model.finetuneEndpoint = finetuneEndpointInput;
            }
        }
	};

	const handlePredictEndpointText = (event) => {
		setPredictEndpointInput(event.target.value);
        enteredPredictEndpoint = false;
		if (event.key === "Enter") {
            enteredPredictEndpoint = true;
            // props.setUserModelFinetuneEndpoint(finetuneEndpointInput);
            let confirmedInput = true;
            if (Model.predictEndpoint === predictEndpointInput) {
                console.log(`Keeping predictEndpoint the same: ${predictEndpointInput}`);
            } else if (Model.predictEndpoint !== "") {
                confirmedInput = window.confirm(`Are you sure you want to change predictEndpoint from\n${Model.predictEndpoint} => ${predictEndpointInput}`);
            } else if (confirmedInput) {
                console.log(`Setting predictEndpoint to ${predictEndpointInput}`)
                Model.predictEndpoint = finetuneEndpointInput;
            }
        }
	};

	const open = Boolean(anchorEl);
	const id = open ? "simple-popover" : undefined;

	const onNextSubmit = () => {
		// console.log(props);
        // validate their endpoint inputs
        let pingFinetuneSuccess = false;
        let pingPredictSuccess = false;
        try { 
            props.getDataWithParams(Model.apiLink + finetuneEndpointInput, {text: "hello, this is a test"});
            pingFinetuneSuccess = true;
        } catch (err) {
            alert("Unable to ping your finetune endpoint. Please re-input.");
            console.log(err.toString())
        }

        try {
            props.getDataWithParams(Model.apiLink  + predictEndpointInput, {text: "hello, this is a test"});
            pingPredictSuccess = true;
        } catch (err) {
            alert("Unable to ping your predict endpoint. Please re-input.");
            console.log(err.toString())
        }

        if (pingFinetuneSuccess && pingPredictSuccess) {
            props.updateState(states.docStep2);
        }
		
	};

	/**
	 * Callback function for next submit action.
	 */
	// basically just have the option for the user to do a keyboard shortcut as well as button press.
	const handleNextKeyPress = (event) => {
		if (event.key === " ") {
			//&& this.state.sectionComplete){
			onNextSubmit();
		}
	};

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Container maxWidth="lg">
				<Header title="NLPDocTool" />
				<main>
					<Stack
						justifyContent="center"
						alignItems="center"
						spacing={4}
						sx={{ paddingTop: 10, paddingRight: 5, paddingLeft: 5 }}
					>
						<h2>
							{" "}
							Follow the steps to produce documentation that complies with our
							documentation best practices{" "}
						</h2>
						<Box component="div" sx={{ display: "inline" }}>
							<Typography
								variant="h6"
								sx={{ fontWeight: 1000, display: "inline" }}
								noWrap={false}
							>
								Step 1:{" "}
							</Typography>
							<Typography
								variant="h6"
								sx={{ fontWeight: 400, display: "inline" }}
							>
								Customize your documentation by linking to a model
							</Typography>
							{/* <Typography paragraph>Note: At this time, only models that are hosted on the Hugging Face Model Hub are supported.</Typography>
            <Typography paragraph>For more information about the models avaiable please see </Typography>
            <Link href="https://huggingface.co/docs/huggingface_hub/index">Hugging Face Hub</Link> */}
							<Typography paragraph>
								Note: At this time, only models that are hosted locally are
								supported.
							</Typography>
                            <Typography paragraph>
                                Additionally, only generative NLP models are supported
                            </Typography>
						</Box>

						<Button
							variant="contained"
							onClick={handleClick}
							aria-describedby={id}
						>
							Enter the endpoints for your model:
						</Button>
					</Stack>
				</main>
			</Container>

			<Popover
				anchorOrigin={{
					vertical: "center",
					horizontal: "center",
				}}
				transformOrigin={{
					vertical: "center",
					horizontal: "center",
				}}
				// this popup was too small, couldn't see everything
				// so I made the dimensions inside larger
				id={id}
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
			>
				<Box component="div" sx={{ minWidth: 450, minHeight: 450 }}>
					<Stack
						justifyContent="center"
						alignItems="center"
						spacing={4}
						sx={{ paddingTop: 5, paddingRight: 5, paddingLeft: 5 }}
					>
						<Typography variant="h6">
							Enter the following information about your model
						</Typography>
                        <ul>
                            {/* <li>
                                Link for your model i.e., "https://localhost:5000"
                            </li> */}
                            <li>
                               Finetune endpoint i.e., "/finetune"
                            </li>
                            <li sx={{display: 'list-item'}}>
                               Predict endpoint i.e., "/predict"
                            </li>
                            <b>Press ENTER when you are done typing each selection.</b>
                        </ul>
                        {/* // todo: add error={} functions for when we try and ping */}
						{/* <TextField
							id="URL"
							label="URL Link"
							variant="filled"
                            required
							fullWidth
							// defaultValue={props.getUserModelLink()}
							onKeyPress={handleUrlText} // check if they're done entering
                            onChange={handleUrlText} // update the value from useState
						/> */}
						<TextField
							id="TRAIN"
							label="Finetune endpoint"
							variant="filled"
                            required
							fullWidth
							// defaultValue={props.getUserModelFinetuneEndpoint()}
							onKeyPress={handleFinetuneEndpointText} // check if they're done entering
                            onChange={handleFinetuneEndpointText} // update the value from useState
						/>
						<TextField
							id="PREDICT"
							label="Predict endpoint"
							variant="filled"
                            required
							fullWidth
							// defaultValue={props.getUserModelPredictEndpoint()}
							onKeyPress={handlePredictEndpointText} // check if they're done entering
                            onChange={handlePredictEndpointText} // update the value from useState
						/>
						{/* Considered using radio buttons instead of text box, 
                but this is more effort than its worth. Gonna go back to just using text boxes instead.
                If I need to use these later, I'll know how at least*/}
						{/* <FormControl>
            <FormLabel id="radio-buttons-label">Prefix</FormLabel>
                <RadioGroup
                    aria-labelledby="radio-buttons-group-label"
                    defaultValue={1}
                    name="radio-buttons-group"
                    row
                >
                    <FormControlLabel value={1} control={<Radio />} label="http://" />
                    <FormControlLabel value={2} control={<Radio />} label="https:// (secure)" />
                </RadioGroup>
            </FormControl> */}

						{/* <Button onClick={() => {console.log({textInput})}}>TEST</Button> */}
						{/* <LinkButton to="/NLPDocTool/step2"
            onClick= {
              () => {
                if(Model.apiLink == null){
                  Model.apiLink = "https://api-inference.huggingface.co/models";
                } else {
                  Model.apiLink = textInput;
                }
              }
            }
            >Confirm</LinkButton> */}

						<Box sx={{ alignItems: "end" }}>
							<CallbackKeyEventButton
								callBackFunc={handleNextKeyPress}
								buttonAvailable={true} // todo: come back and change this => only available later
								clickFunc={onNextSubmit}
								text={"Next (space)"}
							/>
						</Box>
					</Stack>
				</Box>
			</Popover>

			<Footer title="Designed By" description="XXX" />
		</ThemeProvider>
	);
}

class Step1 extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<Step1Content
				updateState={this.props.updateState}
				getOptionID={this.props.getOptionID}
				getDataWithParams={this.props.getDataWithParams}
				postData={this.props.postData}
			/>
		);
	}
}

export default Step1;
