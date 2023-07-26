import { Component } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid"; // Grid version 1
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
import Model from "./Model.js";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import axios from "axios";
import Link from "@mui/material/Link";

import states from "./../../Constants/States";

import CallbackKeyEventButton from "../../Custom/CallbackKeyEventButton";
import LinearProgress from "@material-ui/core/LinearProgress";

const progress = 80;

class Step5 extends Component {
	constructor(props) {
		super(props);

		this.state = {
			compareOutput: "",
			compareOutputIndex: -1,
			// anchorEl: null,
			open: true,
			id: "simple-popover",
			selectedContext: 0,
			modelOutput: "hidden",

			humanResponse: "",
			humanResponseRationale: "",
			resultJustification: "",
			binarySimilarity: 0,

			contextPrediction: "",
			similarityScore: 0,
			sectionComplete: true, // todo: come back and change it so this is only available later
		};
	}

	onNextSubmit = () => {
		this.props.updateState(states.docResults);
	};

	/**
	 * Callback function for next submit action.
	 */
	handleNextKeyPress = (event) => {
		if (event.key === " " && this.state.sectionComplete) {
			this.onNextSubmit();
		}
	};

	// fileInput = document.getElementById('input');

	// open = Boolean(this.state.anchorEl);
	// id = this.open ? 'simple-popover' : undefined;

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
							<h2>Step 5: Compare Human Actions in Each Context </h2>

							<Box component="div" sx={{ display: "inline" }}>
								<Typography
									variant="h6"
									sx={{ fontWeight: 400, display: "inline" }}
									noWrap={false}
								>
									Specify which output you wish to
									compare:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</Typography>
								<FormControl sx={{ width: 200 }}>
									<InputLabel id={"demo-simple-select-label"}>
										Output
									</InputLabel>
									<Select
										labelId={"demo-simple-select-label"}
										id={"output"}
										defaultValue=""
										size="small"
										label="Parameter"
										onChange={(event) => {
											// console.log(Model.parameters);
											this.setState({
												compareOutput: event.target.value,
											});
											this.setState({
												compareOutputIndex: Model.indexOf(
													this.state.compareOutput
												),
											});

											console.log(
												this.state.compareOutput +
													" " +
													this.state.compareOutputIndex
											);
										}}
									>
										{Model.outputs.map((x) => (
											<MenuItem value={x.name}>{x.name}</MenuItem>
										))}
									</Select>
								</FormControl>
							</Box>
							<Box
								sx={{
									width: "100%",
									maxWidth: 600,
									bgcolor: "background.paper",
								}}
							>
								<List>
									{Model.contextNames.map((value) => (
										<ListItem
											key={value}
											component="div"
											divider
											secondaryAction={
												<Box sx={{ bgcolor: "background.paper" }}>
													<Button
														variant="contained"
														onClick={(event) => {
															let number = Model.contextNames.indexOf(value);
															this.setState({
																// anchorEl: event.currentTarget,
																id: "simple-popover",
																open: true,
																selectedContext: number,
															});
														}}
														aria-describedby={this.state.id}
													>
														Specify Human Reaction
													</Button>
												</Box>
											}
										>
											<ListItemText primary={value} />
										</ListItem>
									))}
								</List>
							</Box>

							{/* <LinkButton to="/NLPDocTool/results" onClick={()=>{
                    console.log(Model);
                    // CALL THE PREDICTIONS AND POPULATE MODEL PREDICTIONS
                    // CALCULATE Similarity SCORES 
                }} variant="contained">
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

				<Popover
					anchorOrigin={{
						vertical: "center",
						horizontal: "center",
					}}
					transformOrigin={{
						vertical: "center",
						horizontal: "center",
					}}
					id={this.state.id}
					open={this.state.open}
					// anchorEl={this.state.anchorEl}
					onClose={(event) => {
						this.setState({
							// anchorEl: null,
							open: false,
							id: undefined,
						});
					}}
				>
					<Box component="div" sx={{ minWidth: 600, minHeight: 400 }}>
						<Stack
							justifyContent="center"
							alignItems="center"
							spacing={4}
							sx={{
								paddingTop: 5,
								paddingRight: 5,
								paddingLeft: 5,
								paddingBottom: 5,
							}}
						>
							<Typography variant="h6">
								Context: {Model.contextNames[this.state.selectedContext]}
							</Typography>
							<Typography paragraph>
								{Model.csvInputs[this.state.selectedContext]}
							</Typography>
							<Box sx={{ flexGrow: 1 }}>
								<Grid container spacing={4}>
									<Grid item xs={6}>
										<Typography variant="h6" sx={{ textAlign: "center" }}>
											What would you expect the model's response be in this
											context?
										</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography variant="h6" sx={{ textAlign: "center" }}>
											Why is this a good response? Why does it comply with any
											relevant standards or laws?
										</Typography>
									</Grid>
									<Grid item xs={6}>
										<Box sx={{ width: "300" }}>
											<TextField
												inputProps={{
													cols: "50",
												}}
												multiline
												rows={5}
												fullWidth
												label="Human Response"
												id="HumanResponse"
												onChange={(event) => {
													this.setState({
														humanResponse: event.target.value,
													});
												}}
											/>
										</Box>
									</Grid>
									<Grid item xs={6}>
										<Box sx={{ width: "300" }}>
											<TextField
												inputProps={{
													cols: "50",
												}}
												multiline
												rows={5}
												fullWidth
												label="Rationale"
												id="Rationale"
												onChange={(event) => {
													this.setState({
														humanResponseRationale: event.target.value,
													});
												}}
											/>
										</Box>
									</Grid>
								</Grid>
							</Box>

							<Button
								variant="contained"
								onClick={() => {
									document.getElementById("HumanResponse").disabled = true;
									document.getElementById("Rationale").disabled = true;

									Model.humanResponses[this.state.selectedContext] =
										this.state.humanResponse;
									Model.humanResponseRationale[this.state.selectedContext] =
										this.state.humanResponseRationale;
									this.setState({
										modelOutput: "visible",
									});

									//Run the Hugging Face Prediction

									var data = new URLSearchParams();
									data.append("hfURL", Model.apiLink + Model.endpoint);
									data.append(
										"input",
										Model.csvInputs[this.state.selectedContext]
									);
									data.append("inputName", Model.parameters[0].name);
									data.append("outputName", Model.outputs[0].name);
                                    // todo: come back here and replace this with the a post to the user's /predict endpoint
                                    // we can even write a function in our app to do this and send it through as a prop
                                    // so we can easily show the user what we expect from them.
									axios({
										method: "post",
										url: Model.backendUrl + "/runPrediction",
										data: data,
										headers: {
											"Content-Type": "application/x-www-form-urlencoded",
										},
									}).then((res) => {
										// then print response status
										console.log(res.statusText);

										this.setState({
											contextPrediction: res.data,
										});
										console.log(res.data);
									});

									var data2 = new URLSearchParams();
									data2.append("one", this.state.contextPrediction);
									data2.append("two", this.state.humanResponse);
									axios({
										method: "post",
										url: Model.backendUrl + "/getSimilarity",
										data: data2,
										headers: {
											"Content-Type": "application/x-www-form-urlencoded",
										},
									}).then((res) => {
										// then print response status
										console.log(res.statusText);

										this.setState({
											similarityScore: res.data,
										});
										console.log(res.data);
									});
								}}
							>
								Confirm Human Input & Run prediction
							</Button>

							<Box
								component="div"
								id="ModelOutputBox"
								sx={{ visibility: this.state.modelOutput }}
							>
								<Stack justifyContent="center" alignItems="center" spacing={4}>
									<Typography variant="h6">Model Output</Typography>
									<Typography paragraph>
										{this.state.contextPrediction}
									</Typography>
									<Typography variant="h6">
										Text Similarity Score Between Human Input and Model Response
										by{" "}
										<Link href="https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2">
											all-MiniLM-L6-v2 model on Hugging Face
										</Link>
									</Typography>
									<Typography variant="h6">
										{this.state.similarityScore}
									</Typography>
									<Typography variant="h6">
										Why does this result make sense?
									</Typography>
									<Box sx={{ width: "300" }}>
										<TextField
											inputProps={{
												cols: "50",
											}}
											multiline
											rows={3}
											fullWidth
											label="Rresult Justification"
											id="ResultJustification"
											onChange={(event) => {
												this.setState({
													resultJustification: event.target.value,
												});
											}}
										/>

										<Typography variant="h6">
											<br></br>Is this decision sufficently
											similar?&nbsp;&nbsp;&nbsp;
											<FormControl sx={{ width: 200 }}>
												<InputLabel id={"yes-no-select"}>Similarity</InputLabel>
												<Select
													labelId={"yes-no-select-label"}
													id={"yes"}
													defaultValue=""
													size="small"
													label="Similarity"
													onChange={(event) => {
														// console.log(Model.parameters);
														this.setState({
															binarySimilarity: event.target.value,
														});
													}}
												>
													<MenuItem value={0}>NO</MenuItem>
													<MenuItem value={1}>YES</MenuItem>
												</Select>
											</FormControl>
										</Typography>
									</Box>
								</Stack>
							</Box>

							<Stack direction="row" spacing={70}>
								<Button
									variant="contained"
									onClick={() => {
										this.setState({
											open: false,
											modelOutput: "hidden",
										});
										document.getElementById("HumanResponse").disabled = false;
										document.getElementById("Rationale").disabled = false;
									}}
								>
									Done
								</Button>
								<Button
									variant="contained"
									onClick={() => {
										Model.predictions[this.state.selectedContext] =
											this.state.contextPrediction;
										Model.metricOne[this.state.selectedContext] =
											this.state.similarityScore;
										Model.resultJustification[this.state.selectedContext] =
											this.state.resultJustification;
										Model.metricTwo[this.state.selectedContext] =
											this.state.binarySimilarity;
										this.setState({
											selectedContext: this.state.selectedContext + 1,
											modelOutput: "hidden",
											contextPrediction: "",
											humanResponse: "",
											humanResponseRationale: "",
											resultJustification: "",
										});

										document.getElementById("HumanResponse").value = "";
										document.getElementById("Rationale").value = "";
										document.getElementById("ResultJustification").value = "";

										document.getElementById("HumanResponse").disabled = false;
										document.getElementById("Rationale").disabled = false;
									}}
								>
									Next
								</Button>
							</Stack>
						</Stack>
					</Box>
				</Popover>

				<Footer title="Designed By" description="XXX" />
			</ThemeProvider>
		);
	}
}

export default Step5;
