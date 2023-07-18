import React, { Component } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import GitHubIcon from "@mui/icons-material/GitHub";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Header from "./blog/Header.js";

import Footer from "./blog/Footer.js";
import { red } from "@mui/material/colors";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import theme from "./blog/theme.js";
import Typography from "@mui/material/Typography";
import { IconButton } from "@mui/material";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";

import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import {List, ListItem} from "@mui/material/";
import { useRadioGroup } from "@mui/material/RadioGroup";

import Model from "./Model.js";
import LinkButton from "./LinkButton.js";
import { Navigate } from "react-router-dom";

import states from "./../../Constants/States";
import { useState } from "react"; // to allow the function to know what its props are
import CallbackKeyEventButton from "./../../Custom/CallbackKeyEventButton";
import LinearProgress from "@material-ui/core/LinearProgress";

const progress = 0;

function Step1Content(props) {
	const [anchorEl, setAnchorEl] = React.useState(null);

	const [urlInput, setUrlInput] = React.useState(null);
    const [trainEndpointInput, setTrainEndpointInput] = React.useState(null);
    const [predictEndpointInput, setPredictEndpointInput] = React.useState(null);
    
    var enteredUrl = false;
    var enteredTrainEndpoint = false;
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

	const handleUrlText = (event) => {
		setUrlInput(event.target.value);
        enteredUrl = false;
        if (event.key === "Enter") {
            enteredUrl = true;
            try {
                props.testGetLink(urlInput);
                props.setUserModelLink(urlInput);
            } catch (error) {
                console.log("Something went wrong :0");
                console.log(error);
            }
        }
	};

	const handleTrainEndpointText = (event) => {
		setTrainEndpointInput(event.target.value);
        enteredTrainEndpoint = false;
        if (event.key === "Enter") {
            enteredTrainEndpoint = true;
            props.setUserModelTrainEndpoint(trainEndpointInput);
        }
	};

	const handlePredictEndpointText = (event) => {
		setPredictEndpointInput(event.target.value);
        enteredPredictEndpoint = false;
		if (event.key === "Enter") {
            enteredPredictEndpoint = true;
            props.setUserModelPredictEndpoint(predictEndpointInput);
        }
	};

	const open = Boolean(anchorEl);
	const id = open ? "simple-popover" : undefined;

	const onNextSubmit = () => {
		console.log(props);
		props.updateState(states.docStep2);
		// pass in states.{something}
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
							Select a Model
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
                            <li>
                                Link for your model i.e., "https://localhost:5000"
                            </li>
                            <li>
                               Train endpoint i.e., "/train"
                            </li>
                            <li sx={{display: 'list-item'}}>
                               Predict endpoint i.e., "/predict"
                            </li>
                            <b>Press ENTER when you are done typing each selection.</b>
                        </ul>
                        {/* // todo: add error={} functions for when we try and ping */}
						<TextField
							id="URL"
							label="URL Link"
							variant="filled"
                            required
							fullWidth
							// defaultValue={props.getUserModelLink()}
							onKeyPress={handleUrlText} // check if they're done entering
                            onChange={handleUrlText} // update the value from useState
						/>
						<TextField
							id="TRAIN"
							label="Train endpoint"
							variant="filled"
                            required
							fullWidth
							// defaultValue={props.getUserModelTrainEndpoint()}
							onKeyPress={handleTrainEndpointText} // check if they're done entering
                            onChange={handleTrainEndpointText} // update the value from useState
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

				getUserModelToDocument={this.props.getUserModelToDocument}
				getUserModelLink={this.props.getUserModelLink}
				setUserModelLink={this.props.setUserModelLink}
				
                getUserModelTrainEndpoint={this.props.getUserModelTrainEndpoint}
				setUserModelTrainEndpoint={this.props.setUserModelTrainEndpoint}
				
                getUserModelPredictEndpoint={this.props.getUserModelPredictEndpoint}
				setUserModelPredictEndpoint={this.props.setUserModelPredictEndpoint}

                testGetLink={this.props.testGetLink}
                testPostLink={this.props.testPostLInk}
			/>
		);
	}
}

export default Step1;
