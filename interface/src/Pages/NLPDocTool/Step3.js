import React, { Component } from "react";
import axios from "axios";

import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
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
import Model from "./Model.js";
import LinkButton from "./LinkButton.js";
import { Navigate } from "react-router-dom";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";

// import App from './App.js';
import states from "./../../Constants/States";

import CallbackKeyEventButton from "../../Custom/CallbackKeyEventButton";
import LinearProgress from "@material-ui/core/LinearProgress";

const progress = 40; /* TODO: set this to the intermediate value between previous progress and next progress*/

class Step3 extends Component {
	constructor(props) {
		super(props);
		this.state = {
			fieldArray: [],
			fieldParameters: [],
			selectedFile: undefined,
			objectArray: [],
			sectionComplete: true, // todo: come back and change it so this is only available later
		};
	}

	onNextSubmit = () => {
		this.props.updateState(states.docStep4);
		// pass in states.{something}
	};

	/**
	 * Callback function for next submit action.
	 */
	// basically just have the option for the user to do a keyboard shortcut as well as button press.
	handleNextKeyPress = (event) => {
		if (event.key === " " && this.state.sectionComplete) {
			this.onNextSubmit();
		}
	};

	// fileInput = document.getElementById('input');

	initalizeFileArray(fieldNumber) {
		let newArray = [];
		for (let index = 0; index < fieldNumber; index++) {
			let nameString = "Field " + index;
			newArray.push({ id: index, name: nameString });
		}
		this.setState({
			fieldArray: newArray,
		});
		console.log(this.state.fieldArray);
	}

	addParameter = (event) => {
		console.log(Model.parameters);
		this.state.fieldParameters[0] = event.target.value;
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
							spacing={4}
							sx={{ paddingTop: 10, paddingRight: 5, paddingLeft: 5 }}
						>
							<h2>Step 3: Upload Your Contexts </h2>
							<Typography paragraph>A Context is: BLAH BLAH BLAH</Typography>
							<Typography paragraph>
								The CSV should follow this format:
							</Typography>
							<ul>
								<li>NO HEADER</li>
								<li>No whitespace</li>
								<li>Comma deliminator</li>
								<li>Surround text with double quotes</li>
							</ul>
							<Button variant="contained" component="label">
								Upload
								<input
									hidden
									accept=".csv"
									type="file"
									onChange={(event) => {
										this.setState({
											selectedFile: event.target.files[0],
										});

										const data = new FormData();
										data.append("file", event.target.files[0]);

										console.log(data);
										console.log(this.state.selectedFile);
										// axios.post(Model.backendUrl+"/processFile", data, {

										// })
                                        try {
                                            axios({
                                                method: "post",
                                                url: Model.backendUrl + "/processFile",
                                                data: data,
                                                headers: { "Content-Type": "multipart/form-data" },
                                            }).then((res) => {
                                                // then print response status
                                                console.log(res.statusText);

                                                this.setState({
                                                    objectArray: res.data,
                                                });
                                                let fieldNumber = res.data.length; //SET THIS
                                                console.log(fieldNumber);
                                                console.log(res.data);
                                                this.initalizeFileArray(fieldNumber);
                                            });
                                        } catch (err) {
                                            console.error("Error response from post(/NLPDocTool/api/processFile):");
                                            console.error(err.response.data);    // ***
                                            console.error(err.response.status);  // ***
                                            console.error(err.response.headers)
                                        }
									}}
								/>
							</Button>
							<Typography variant="h6">
								Please match the fields in your context CSV to your prediction
								parameters
							</Typography>
							<Box
								sx={{
									width: "100%",
									maxWidth: 600,
									bgcolor: "background.paper",
								}}
							>
								<List>
									<ListItem
										key={0}
										component="div"
										divider
										sx={{ paddingTop: 4, paddingBottom: 4 }}
									>
										<ListItemText primary={"Field 0"} />
										<ListItemText primary={"Context Name"} />
									</ListItem>
									{this.state.fieldArray.slice(1).map((value) => (
										<ListItem
											key={value.id}
											component="div"
											divider
											sx={{ paddingTop: 4, paddingBottom: 4 }}
											secondaryAction={
												<Box sx={{ width: 300, bgcolor: "background.paper" }}>
													<FormControl fullWidth>
														<InputLabel
															id={"demo-simple-select-label" + value.id}
														>
															Parameter
														</InputLabel>
														<Select
															labelId={"demo-simple-select-label" + value.id}
															id={value.name}
															defaultValue=""
															label="Parameter"
															onChange={(event) => {
																// console.log(Model.parameters);
																this.state.fieldParameters[value.id] =
																	event.target.value;

																console.log(this.state.fieldParameters);
															}}
														>
															{Model.parameters.map((x) => (
																<MenuItem value={x.id}>{x.name}</MenuItem>
															))}
															<MenuItem value={"IGNORE"}>
																No Parameter/Ignore
															</MenuItem>
														</Select>
													</FormControl>
												</Box>
											}
										>
											<ListItemText primary={value.name} />
										</ListItem>
									))}
								</List>
							</Box>

							{/* <LinkButton to="/NLPDocTool/step4" variant="contained"
                onClick={
                    () => {
                        this.state.fieldParameters[0] = "ContextName";
                        Model.fields = this.state.fieldArray;
                        Model.fieldParameters = this.state.fieldParameters;
                        
                        this.state.objectArray.map((el) => {
                            Model.contextNames.push(el.contextName);
                            Model.csvInputs.push(el.input);
                        }

                        )
                        
                        // Model.contextNames
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

export default Step3;
